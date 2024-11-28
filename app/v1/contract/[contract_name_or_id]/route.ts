import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'

/**
 * @swagger
 * /v1/contract/{contract_name_or_id}:
 *   get:
 *     tags: [Contracts]
 *     description: Returns the contract ID
 *     summary: Resolves a contract name and returns the ID
 *     parameters:
 *      - name: contract_name_or_id
 *        schema:
 *          type: string
 *        in: path
 *        description: Name of the contract (for system contracts), nickname, or KAP name
 *        required: true
 *        example: koin
 *     responses:
 *       200:
 *        description: Contract ID
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                contract_id:
 *                  type: string
 *            example:
 *              value: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
 */
export async function GET(request: Request, { params }: { params: { contract_name_or_id: string } }) {
  try {
    try {
      return Response.json({contract_id: await getContractId(params.contract_name_or_id)})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
