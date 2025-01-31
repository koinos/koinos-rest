import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/approve:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Approves a user for a token, returning the operation.
 *     summary: Approves a user for a token, returning the operation.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: Koinos address of the contract
 *       required: true
 *       example: "@koinos.fun"
 *     - name: token_id
 *       in: path
 *       schema:
 *         type: string
 *       description: The token ID
 *       required: true
 *       example: "0x35303437"
 *     - name: operator
 *       in: query
 *       schema:
 *         type: string
 *       description: Koinos address of the account operating the token
 *       required: true
 *       example: 1EnaBDVTA5hqXokC2dDzt2JT5eHv1y7ff1
 *     - name: approve
 *       in: query
 *       schema:
 *         type: boolean
 *       description: Whether to approve the operator or not.
 *       required: false
 *       example: true
 *     - name: memo
 *       in: query
 *       schema:
 *         type: string
 *       description: Optional memo
 *       required: false
 *     responses:
 *       200:
 *        description: Operation
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                call_contract:
 *                  type: object
 *                  properties:
 *                    contract_id:
 *                      type: string
 *                    entry_point:
 *                      type: integer
 *                    args:
 *                      type: string
 *            example:
 *              call_contract:
 *                contract_id: 1EnaBDVTA5hqXokC2dDzt2JT5eHv1y7ff1
 *                entry_point: 1960973952
 *                args: "ChkAY8ED6InNJ-LSQhg38spEhfSAWi8UN6HnEhkAlzgMKVPolWBD5lWUM7yqKcudeRB3V_SkGgQ1MDQ3"
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string, token_id: string } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      const { searchParams } = new URL(request.url)
      const operator = searchParams.get('operator')
      const approved = searchParams.get('approved')
      const memo = searchParams.get('memo')

      try {
        const { result: ownerRes } = await contract.functions.owner_of({
          token_id: params.token_id
        });

        return Response.json(await contract.encodeOperation({
          name: 'approve',
          args: {
            owner: ownerRes?.value,
            operator: operator,
            token_id: params.token_id,
            approved: approved ? approved == 'true' : undefined,
            memo
          }
        }));
      } catch (error) {
        throw new AppError(getErrorMessage(error as Error))
      }
    } catch (error) {
      return handleError(error as Error)
    }
  }