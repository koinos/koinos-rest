import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/uri:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the URI associated with the non fungible token contract.
 *     summary: Obtains the Uniform Resource Identifier (URI) for a Non Fungible Token contract, typically pointing to metadata.
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
 *        description: URI of the Non Fungible Token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: "https://www.koinos.fun/metadata"
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)

    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.uri()

      if (result)
        return Response.json(result)
      return Response.json({})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
