import { getContractId } from '@/utils/contracts'
import { handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'

/**
 * @swagger
 * /v1/contract/{contract_name}:
 *   get:
 *     tags: [Contracts]
 *     description: Returns the contract's address
 *     summary: Resolves a contract name and returns the address
 *     parameters:
 *      - name: contract_name
 *        schema:
 *          type: string
 *        in: path
 *        description: Name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: koin
 *     responses:
 *      200:
 *        description: Contract Metadata
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                contract_id:
 *                  type: string
 *            example:
 *              contract_id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)

    return Response.json({ contract_id })
  } catch (error) {
    return handleError(error as Error)
  }
}
