import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/approved_for_all/{owner}/{operator}:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns if the operator is approved for all tokens of the owner.
 *     summary: Returns if the operator is approved for all tokens of the owner.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the NFT contract.
 *       required: true
 *       example: "@koinos.fun"
 *     - name: owner
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the owner.
 *       required: true
 *       example: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
 *     - name: operator
 *       in: path
 *       schema:
 *         type: string
 *       description: The Koinos address of the operator.
 *       required: true
 *       example: 1375fejMdAE4E4BCiKqqdAbCvQYPoXmSio
 *     responses:
 *       200:
 *        description: If the operator is approved for all tokens of the owner.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: boolean
 *            example:
 *              value: false
 */

export async function GET(request: Request, { params }: { params: { contract_id: string, owner: string, operator: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    try {
      const { result } = await contract.functions.is_approved_for_all({
        owner: params.owner,
        operator: params.operator,
      });

      if (result)
        return Response.json(result);
      return Response.json({value: false})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
