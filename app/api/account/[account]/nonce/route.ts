import { config } from '@/app.config'
import { getAddress } from '@/utils/addresses'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { Provider } from 'koilib'

/**
 * @swagger
 * /api/account/{account}/nonce:
 *   get:
 *     tags: [Accounts]
 *     description: Returns the account's nonce
 *     parameters:
 *      - name: account
 *        schema:
 *          type: string
 *        in: path
 *        description: Koinos address of the account, name of the account (for system contracts) or KAP name
 *        required: true
 *     responses:
 *       200:
 *        description: Value
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Value'
 */
export async function GET(request: Request, { params }: { params: { account: string } }) {
  try {
    const provider = new Provider(config.jsonRPC)
    const account = await getAddress(params.account)
    try {
      const nonce = await provider.getNonce(account, false)
      return Response.json({
        value: nonce
      })
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}