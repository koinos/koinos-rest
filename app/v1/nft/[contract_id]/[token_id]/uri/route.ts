import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/uri:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the uri of the token metadata.
 *     summary: Returns the uri of the token metadata.
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
 *        description: The metadata uri
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: https://koinos.fun/metadata/0x35303437
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.token_uri({
        token_id: params.token_id
      });

      return result?.value ?
        Response.json(JSON.parse(result?.value)) :
        Response.json({});
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
