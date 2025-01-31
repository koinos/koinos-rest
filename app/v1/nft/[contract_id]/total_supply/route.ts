import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/total_supply:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the total supply of the non fungible token.
 *     summary: Retrieves the total supply of Non Fungible Tokens issued under a specific contract.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: The Koinos address of the NFT contract.
 *        required: true
 *        example: "@koinos.fun"
 *     responses:
 *       200:
 *        description: Total Supply of the Non Fungible Token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: "6086"
 */
export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.total_supply()

      if (result)
        return Response.json(result)
      return Response.json({value: "0"})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
