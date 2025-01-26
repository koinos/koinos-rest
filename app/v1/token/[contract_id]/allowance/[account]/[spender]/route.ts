import { getAccountAddress } from '@/utils/addresses'
import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getTokenContract } from '@/utils/tokens'
import { utils } from 'koilib'

/**
 * @swagger
 * /v1/token/{contract_id}/allowance/{account}/{spender}:
 *   get:
 *     tags: [Fungible Tokens]
 *     description: Returns the token allowance for an account and spender.
 *     summary: Returns the token allowance for a an account and spender.
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
 *      - name: spender
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the spender, name of the account (for system contracts) or KAP name
 *        required: true
 *        example: 16cMcG2J5YdSUEV2GYgMs163iFe7c1uhEj
 *     responses:
 *       200:
 *        description: Allowance
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: "16182.6312157"
 */

export async function GET(
  request: Request,
  { params }: { params: { contract_id: string; account: string, spender: string } }
) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getTokenContract(contract_id)

    const account = await getAccountAddress(params.account)
    const spender = await getAccountAddress(params.spender)

    try {
      const { result: allowanceRes } = await contract.functions.allowance({
        owner: account,
        spender: spender
      })
      const { result: decimalRes } = await contract.functions.decimals()

      return Response.json({
        value: utils.formatUnits(allowanceRes!.value, decimalRes!.value)
      })
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
