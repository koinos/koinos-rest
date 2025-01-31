import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/owner/{account}:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the tokens owned by the account.
 *     summary: Returns the tokens owned by the account.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@koinos.fun"
 *     - name: account
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of owner account.
 *       required: true
 *       example: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
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
 *              values:
 *              - "0x3537"
 *              - "0x31363238"
 *              - "0x31363431"
 *              - "0x32313230"
 *              - "0x35303437"
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, account: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const owner = await getContractId(params.account)
    const contract = getNFTContract(contract_id)

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const limit = searchParams.get('limit')
    const descending = searchParams.get('descending')

    try {
      const { result } = await contract.functions.get_tokens_by_owner({
        owner,
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
