import { utils } from 'koilib';
import { getContract, getContractId, processArgs } from '@/utils/contracts'
import qs from 'qs'
import { AppError, handleError, getErrorMessage } from '@/utils/errors'

/**
 * @swagger
 * /v1/contract/{contract_id}/{method}:
 *   get:
 *     tags: [Contracts]
 *     description: Read the contract contract using the method and arguments provided
 *     summary: Executes a specified 'read' method on the given contract and returns the result, without making any state changes.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *      - name: method
 *        in: path
 *        schema:
 *          type: string
 *        description: Method of the contract to call
 *        required: true
 *        example: balance_of
 *      - name: arguments
 *        in: query
 *        schema:
 *          type: object
 *        example:
 *          owner: "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS"
 *     responses:
 *       200:
 *        description: Call response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *            example:
 *              value: "1607990396956"
 */

export async function GET(
  request: Request,
  { params }: { params: { contract_id: string; method: string } }
) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const method = params.method

    let { search } = new URL(request.url)

    let args = {}
    if (search) {
      if (search.startsWith('?')) {
        search = search.substring(1)
      }
      args = qs.parse(search, { allowDots: true })
    }

    try {
      const contract = await getContract(contract_id)

      if (!contract?.functions[method]) {
        throw new AppError(`method "${method}" does not exist`)
      }

      // process args
      if (contract.abi!.methods[method].argument) {
        args = await processArgs(
          args,
          contract.serializer?.root,
          contract.serializer?.root.lookupType(contract.abi!.methods[method].argument!)
        )
      }

      // If the method is a write method, return the operation
      if (!contract.abi!.methods[method].read_only!) {
        return Response.json(await contract.encodeOperation({name: method, args}))
      }
      else {
        const { result } = await contract.functions[method](args)

        return Response.json(result)
      }
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}

/**
 * @swagger
 * /v1/contract/{contract_id}/{method}:
 *   post:
 *     tags: [Contracts]
 *     description: Read the contract using the method and arguments provided
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *      - name: method
 *        in: path
 *        schema:
 *          type: string
 *        description: Method of the contract to call
 *        required: true
 *        example: balance_of
 *     requestBody:
 *      description: Arguments for the method call
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *          example:
 *            owner: "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS"
 *     responses:
 *       200:
 *        description: Call response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *            example:
 *              value: "1607990396956"
 */

export async function POST(
  request: Request,
  { params }: { params: { contract_id: string; method: string } }
) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const method = params.method
    let args = await request.json()

    try {
      const contract = await getContract(contract_id)

      if (!contract?.functions[method]) {
        throw new AppError(`method "${method}" does not exist`)
      }

      // process args
      if (contract.abi!.methods[method].argument) {
        args = await processArgs(
          args,
          contract.serializer?.root,
          contract.serializer?.root.lookupType(contract.abi!.methods[method].argument!)
        )
      }

      // If the method is a write method, return the operation
      if (!contract.abi!.methods[method].read_only!) {
        return Response.json(await contract.encodeOperation({name: method, args}))
      }
      else {
        const { result } = await contract.functions[method](args)

        return Response.json(result)
      }
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
