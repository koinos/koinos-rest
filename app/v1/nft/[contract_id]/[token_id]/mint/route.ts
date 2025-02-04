import { getAccountAddress } from '@/utils/addresses';
import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'
import { requireParameters } from '@/utils/validation';

/**
 * @swagger
 * /v1/nft/{contract_id}/{token_id}/mint:
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
 *       required: true
 *       example: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
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
 *                entry_point: 3698268091
 *                args: "ChkAY8ED6InNJ-LSQhg38spEhfSAWi8UN6HnEgI5Nw=="
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string; token_id: string } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      const { searchParams } = new URL(request.url)
      requireParameters(searchParams, 'to')

      const to = await getAccountAddress(searchParams.get('to')!)
      const memo = searchParams.get('memo')

      try {
        return Response.json(await contract.encodeOperation({
          name: 'mint',
          args: {
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