import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/owner:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the owner of the collection.
 *     summary: Returns the owner of the collection.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@koinos.fun"
 *     responses:
 *       200:
 *        description: The owner of the collection
 *        content:
 *          application/json:
 *            schema:
 *              type: string
 *            example:
 *              value: 1EnaBDVTA5hqXokC2dDzt2JT5eHv1y7ff1
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.owner()

      return Response.json(result);
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
