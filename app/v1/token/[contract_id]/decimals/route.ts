import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getTokenContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/token/{contract_id}/decimals:
 *   get:
 *     tags: [Fungible Tokens]
 *     description: Returns the number of decimals for a token.
 *     summary: Fetches the decimal precision used by a token.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *     responses:
 *       200:
 *        description: Token decimals
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: integer
 *                  format: int32
 *            example:
 *              value: 8
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const contract = getTokenContract(contract_id)

    try {
      const { result } = await contract.functions.decimals()
      return Response.json(result)
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
