import { getAccountAddress } from '@/utils/addresses'
import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getTokenContract } from '@/utils/tokens'
import { requireParameters } from '@/utils/validation'
import { utils } from 'koilib'

/**
 * @swagger
 * /v1/token/{contract_id}/allowances/{account}:
 *   get:
 *     tags: [Fungible Tokens]
 *     description: Returns the paginated allowances of a token for an account.
 *     summary: Returns the paginated allowances of a token for an account.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *      - name: account
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the account, name of the account (for system contracts) or KAP name
 *        required: true
 *        example: 1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS
 *      - name: start
 *        in: query
 *        schema:
 *          type: string
 *        description: Koinos address of the spender, name of the account (for system contracts) or KAP name. If empty, starts from beginning.
 *        required: false
 *        example: 16cMcG2J5YdSUEV2GYgMs163iFe7c1uhEj
 *      - name: limit
 *        in: query
 *        schema:
 *          type: integer
 *        description: Limit on number of allowances to return
 *        example: 10
 *        required: true
 *     responses:
 *       200:
 *        description: Allowance
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                owner:
 *                  value: string
 *                allowances:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      spender:
 *                        type: string
 *                      value:
 *                        type: string
 *            example:
 *              owner: "1NsQbH5AhQXgtSNg1ejpFqTi2hmCWz1eQS"
 *              allowances:
 *              - spender: "16cMcG2J5YdSUEV2GYgMs163iFe7c1uhEj"
 *                value: "16182.6312157"
 */

export async function GET(
  request: Request,
  { params }: { params: { contract_id: string; account: string } }
) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getTokenContract(contract_id)

    const account = await getAccountAddress(params.account)

    const { searchParams } = new URL(request.url)
    requireParameters(searchParams, 'limit');

    const start = searchParams.get('start')
    const limit = searchParams.get('limit')

    try {
      let { result: getAllowancesRes } = await contract.functions.get_allowances({
        owner: account,
        start,
        limit
      })
      const { result: decimalRes } = await contract.functions.decimals()

      if (getAllowancesRes && getAllowancesRes.allowances) {
        getAllowancesRes.owner = account

        getAllowancesRes!.allowances.forEach(function(allowance: any) {
          allowance.value = utils.formatUnits(allowance.value, decimalRes!.value)
        })
      }
      else  {
        getAllowancesRes = {owner: account};
      }

      return Response.json(getAllowancesRes)
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
