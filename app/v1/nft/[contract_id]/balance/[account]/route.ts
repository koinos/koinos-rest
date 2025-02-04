import { getAccountAddress } from '@/utils/addresses';
import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/balance/{account}:
 *   get:
 *     tags: [Non Fungible Tokens]
 *     description: Returns the non fungible token's account balance.
 *     summary: Retrieves the balance of Non Fungible Tokens under a specific contract address for a given account address.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: The Koinos address of the NFT contract.
 *        required: true
 *        example: "@koinos.fun"
 *      - name: account
 *        in: path
 *        schema:
 *          type: string
 *        description: The Koinos address of the account to query.
 *        required: true
 *        example: 1A6T7vmfwyGx2LD11RREwtcoXrLxG6q2rz
 *     responses:
 *       200:
 *        description: Account Balance in NFTs
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                value:
 *                  type: string
 *            example:
 *              value: "5"
 */

export async function GET(
  request: Request,
  { params }: { params: { contract_id: string; account: string } }
) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const contract = getNFTContract(contract_id)

    const owner = await getAccountAddress(params.account)

    try {
      const { result: balanceRes } = await contract.functions.balance_of({
        owner
      })

      if (balanceRes)
        return Response.json(balanceRes)
      return Response.json({value: "0"})
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
