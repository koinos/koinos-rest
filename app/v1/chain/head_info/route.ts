import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'

/**
 * @swagger
 * /v1/chain/head_info:
 *   get:
 *     tags: [Chain]
 *     description: Returns the chain's head info
 *     summary: Provides information about the current head of the blockchain, including its height and id.
 *     responses:
 *       200:
 *        description: Head Info
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/HeadInfo'
 */
export async function GET() {
  try {
    const provider = getProvider()

    try {
      const headInfo = await provider.getHeadInfo()
      return Response.json(headInfo)
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
