import { AppError, handleError } from '@/utils/errors'
import { getContractSwagger } from '@/utils/swagger'

/**
 * @swagger
 * /v1/contract/{contract_id}/abi:
 *   get:
 *     tags: [Contracts]
 *     description: Returns a Swagger file for the Contract's methods
 *     summary: Returns a Swagger file for the Contract, detailing its methods.
 *     parameters:
 *      - name: contract_id
 *        schema:
 *          type: string
 *        in: path
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    return Response.json(await getContractSwagger(params.contract_id))
  } catch (error) {
    return handleError(error as Error)
  }
}
