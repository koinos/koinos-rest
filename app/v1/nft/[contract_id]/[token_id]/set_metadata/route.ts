import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/set_metadata:
 *   post:
 *     tags: [Non Fungible Tokens]
 *     description: Sets the metadata of the token.
 *     summary: Sets the metadata of the token.
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
 *     requestBody:
 *       description: Token metadata
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *           example:
 *             name: Violet Vigilante
 *     responses:
 *       200:
 *        description: The owner of the token
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *            example:
 *              call_contract:
 *                contract_id: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *                entry_point: 1029287705
 *                args: "CgQ1MDQ3Eht7Im5hbWUiOiJWaW9sZXQgVmlnaWxhbnRlIn0="
 */

export async function POST(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      return Response.json(await contract.encodeOperation({
        name: 'set_metadata',
        args: {
          token_id: params.token_id,
          metadata: JSON.stringify(await request.json()), // Removes whitespace for efficient storage
        },
      }));
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
