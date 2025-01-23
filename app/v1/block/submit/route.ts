import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { BlockJson, BlockReceipt } from 'koilib'
import { getProvider } from '@/utils/providers'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * @swagger
 * /v1/block/submit:
 *   post:
 *     tags: [Blocks]
 *     description: This endpoint takes a block and submits it to the JSON RPC node.
 *     summary: Submits a block to the blockchain network for processing.
 *     requestBody:
 *      description: Arguments
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *
 *     responses:
 *       200:
 *        description: Call response
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 */

export async function POST(request: NextRequest) {
  try {
    // Get the JSON RPC provider
    const provider = getProvider()

    const block = (await request.json()) as BlockJson

    try {
      // Submit the block to the JSON RPC using the provider
      const { receipt } = await provider.call<{
              receipt?: BlockReceipt
            }>('chain.submit_block', {block})

      const submitPath = request.nextUrl.searchParams.get('submit') || '/'
      revalidatePath(submitPath)

      return NextResponse.json(receipt)
    } catch (error) {
      throw new AppError(getErrorMessage(error as Error))
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
