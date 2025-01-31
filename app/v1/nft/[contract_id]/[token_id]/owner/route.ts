import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/owner:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the owner of the token.
 *     summary: Returns the owner of the token.
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
 *       example: "0x35303437"
 *     responses:
 *       200:
 *        description: The owner of the token
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *            example:
 *              value: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.owner_of({
        token_id: params.token_id
      })

      return Response.json(result);
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
