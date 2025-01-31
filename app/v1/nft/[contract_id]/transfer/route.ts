import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/transfer:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Transfers the ownership of the collection, returning the operation.
 *     summary: Transfers the ownership of the collection, returning the operation.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract
 *        required: true
 *        example: "@koinos.fun"
 *      - name: to
 *        in: query
 *        schema:
 *          type: string
 *        description: Koinos address of the account to transfer ownership to
 *        required: true
 *        example: 1LDDWoGgQ1CEa8B1d9GuziQ4fgbxcqawC3
 *     responses:
 *       200:
 *        description: Operation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                call_contract:
 *                  type: object
 *                  properties:
 *                    contract_id:
 *                      type: string
 *                    entry_point:
 *                      type: integer
 *                    args:
 *                      type: string
 *            example:
 *              call_contract:
 *                contract_id: 1EnaBDVTA5hqXokC2dDzt2JT5eHv1y7ff1
 *                entry_point: 961275650
 *                args: ChkA0rnTz8xKlpYbq8-qHDavNe-FbwNIv4Lg
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string; } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      const { searchParams } = new URL(request.url)
      const to = searchParams.get('to')

      try {
        return Response.json(await contract.encodeOperation({
          name: 'transfer_ownership',
          args: {
            to
          }
        }))
      } catch (error) {
        throw new AppError(getErrorMessage(error as Error))
      }
    } catch (error) {
      return handleError(error as Error)
    }
  }