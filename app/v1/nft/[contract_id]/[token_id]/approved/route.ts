import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/approved:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the approved operators for the token
 *     summary: Returns the approved operators for the token.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@koinos.fun"
 *     - name: token_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The token ID
 *       required: true
 *       example: 0x3937
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
 *        description: The operator's approval status for the token
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
 *              value: []
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const contract = getNFTContract(contract_id)

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const limit = searchParams.get('limit')
    const descending = searchParams.get('descending')

    try {
      const { result: approvedRes } = await contract.functions.get_approved({
        token_id: params.token_id,
        start,
        limit,
        descending: descending ? descending == 'true' : undefined
      })

      if (approvedRes?.values) {
        return Response.json({value: approvedRes?.values})
      }

      if (approvedRes?.value){
        return Response.json({value: [approvedRes?.value]})
      }

      return Response.json({value: []})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
