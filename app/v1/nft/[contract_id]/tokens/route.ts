import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/tokens:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the symbol of the non fungible token.
 *     summary: Retrieves the symbol associated with a specific Non Fungible Token contract.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@koinos.fun"
 *     - name: start
 *       in: query
 *       schema:
 *         type: string
 *         example: "\"0x00\""
 *       description: Token ID to start with
 *       required: true
 *     - name: limit
 *       in: query
 *       schema:
 *         type: integer
 *         example: 5
 *       description: Number of tokens to return
 *       required: true
 *     - name: descending
 *       in: query
 *       schema:
 *         type: boolean
 *         example:
 *       description: "Flag to return tokens in descending order (default: false)"
 *       required: false
 *     responses:
 *       200:
 *        description: Symbol of the Non Fungible Token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: array
 *                  items:
 *                    type: string
 *            example:
 *              value:
 *              - "0x31"
 *              - "0x32"
 *              - "0x33"
 *              - "0x34"
 *              - "0x35"
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const limit = searchParams.get('limit')
    const descending = searchParams.get('descending')

    try {
      const { result } = await contract.functions.get_tokens({
        start,
        limit,
        descending: descending ? descending !== 'false' : false
      })

      if (result)
        return Response.json(result)
      return Response.json({values:[]})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
