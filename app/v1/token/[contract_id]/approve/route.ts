import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getTokenContract } from '@/utils/tokens'
import { utils } from 'koilib'

/**
 * @swagger
 * /v1/token/{contract_id}/approve:
 *   get:
 *     tags: [Fungible Tokens]
 *     description: Returns a serialized token approve operation.
 *     summary: Returns a serialized token approve operation.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *      - name: owner
 *        in: query
 *        schema:
 *          type: string
 *        description: Koinos address of the account, name of the account (for system contracts) or KAP name
 *        required: true
 *        example: 1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS
 *      - name: spender
 *        in: query
 *        schema:
 *          type: string
 *        description: Koinos address of the account, name of the account (for system contracts) or KAP name
 *        required: true
 *        example: 1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS
 *      - name: value
 *        in: query
 *        schema:
 *          type: string
 *        description: Amount of token to approve
 *        required: true
 *        example: "123.456"
 *      - name: memo
 *        in: query
 *        schema:
 *          type: string
 *        description: Approval memo
 *        required: false
 *        example: "For pizza"
 *     responses:
 *       200:
 *        description: Account balance
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: "16182.6312157"
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string; } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getTokenContract(contract_id)

      const { searchParams } = new URL(request.url)

      const owner = searchParams.get('owner')
      const spender = searchParams.get('spender')
      const value = searchParams.get('value')
      const memo = searchParams.get('memo')

      try {
        const {result: decimalsRes} = await contract.functions.decimals()

        return Response.json(await contract.encodeOperation({
          name: 'approve',
          args: {
            owner,
            spender,
            value: utils.parseUnits(value!, decimalsRes!.value),
            memo
          }
        }))
      } catch (error) {
        throw new AppError(getErrorMessage(error as Error))
      }
    } catch (error) {
      return handleError(error as Error)
    }
  }