import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'

/**
 * @swagger
 * /v1/chain/fork_heads:
 *   get:
 *     tags: [Chain]
 *     description: Returns the chain's fork heads
 *     summary: Retrieves the current fork heads of the Koinos blockchain, indicating any divergences in the chain.
 *     responses:
 *       200:
 *        description: Fork Heads
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ForkHeads'
 */
export async function GET() {
  try {
    const provider = getProvider()

    try {
      const forkHeads = await provider.call('chain.get_fork_heads', {})
      return Response.json(forkHeads)
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
