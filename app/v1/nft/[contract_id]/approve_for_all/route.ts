import { getAccountAddress } from '@/utils/addresses';
import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'
import { requireParameters } from '@/utils/validation';

/**
 * @swagger
 * /v1/nft/{contract_id}/approve_for_all:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Approves a user for all an owner's tokens in collection, returning the operation.
 *     summary: Approves a user for all an owner's tokens in collection, returning the operation.
 *     parameters:
 *     - name: contract_id
 *       in: path
 *       schema:
 *         type: string
 *       description: Koinos address of the contract
 *       required: true
 *       example: "@koinos.fun"
 *     - name: owner
 *       in: query
 *       schema:
 *         type: string
 *       description: Koinos address of the account owning the tokens
 *       required: true
 *       example: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
 *     - name: operator
 *       in: query
 *       schema:
 *         type: string
 *       description: Koinos address of the account operating the tokens
 *       required: true
 *       example: 1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS
 *     - name: approved
 *       in: query
 *       schema:
 *         type: boolean
 *       description: If the operator is approved. (Defaults to true)
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
 *                entry_point: 541336086
 *                args: "ChkAY8ED6InNJ-LSQhg38spEhfSAWi8UN6HnEhkA7-Mh3yERswBXFp2UPvegxIiGAauR1O_zGAE="
 */
export async function GET(
    request: Request,
    { params }: { params: { contract_id: string; } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      const { searchParams } = new URL(request.url)
      requireParameters(searchParams, 'owner', 'operator')

      const owner = await getAccountAddress(searchParams.get('owner')!)
      const operator = await getAccountAddress(searchParams.get('operator')!)
      const approved = searchParams.get('approved') === 'true'
      const memo = searchParams.get('memo')

      try {
        return Response.json(await contract.encodeOperation({
          name: 'set_approval_for_all',
          args: {
            owner,
            operator,
            approved,
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