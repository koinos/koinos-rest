import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/royalties:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the royalties of the collection.
 *     summary: Returns the royalties of the collection.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@moonboys.koincity"
 *     responses:
 *       200:
 *        description: The royalties of the collection.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  percentage:
 *                    type: string
 *                  address:
 *                    type: string
 *            example:
 *              value:
 *              - percentage: "2500"
 *                address: 1AhGbSHUVaTWV1oqJRSTihsi2ofEvvYevg
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, token_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.royalties()

      if (result)
        return Response.json(result);
      return Response.json({value: []})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
