import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/transfer:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Burns the token, returning the operation.
 *     summary: Burns the token, returning the operation.
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
 *       example: "0x3937"
 *     - name: to
 *       in: query
 *       schema:
 *         type: string
 *       description: Koinos address to receive the NFT
 *       required: false
 *       example: 1LDDWoGgQ1CEa8B1d9GuziQ4fgbxcqawC3
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
 *                entry_point: 670398154
 *                args: ChkAlzgMKVPolWBD5lWUM7yqKcudeRB3V_SkEhkA0rnTz8xKlpYbq8-qHDavNe-FbwNIv4LgGgI5Nw==
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string; token_id: string } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      const { searchParams } = new URL(request.url)
      const to = searchParams.get('to')
      const memo = searchParams.get('memo')

      try {
        const { result: ownerRes } = await contract.functions.owner({
          token_id: params.token_id
        });

        return Response.json(await contract.encodeOperation({
          name: 'transfer',
          args: {
            from: ownerRes?.value,
            token_id: params.token_id,
            to,
            memo
          }
        }))
      } catch (error) {
        throw new AppError(getErrorMessage(error as Error))
      }
    } catch (error) {
      return handleError(error as Error)
    }
  }