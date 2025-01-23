import { BlockJson, EventData, TransactionReceipt } from 'koilib'
import { AppError, handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'
import { decodeEvents } from '@/utils/events'
import { decodeOperations } from '@/utils/operations'

/**
 * @swagger
 * /v1/blocks:
 *   get:
 *     tags: [Blocks]
 *     description: Batch query blocks by height.
 *     parameters:
 *      - name: start
 *        in: query
 *        schema:
 *          type: integer
 *          example: 1
 *        description: The starting block number
 *        required: true
 *      - name: limit
 *        in: query
 *        schema:
 *          type: integer
 *          example: 10
 *        description: The limit of the number of blocks to be returned
 *      - name: return_block
 *        in: query
 *        schema:
 *          type: boolean
 *        description: Whether or not the block content should be returned
 *      - name: return_receipt
 *        in: query
 *        schema:
 *          type: boolean
 *        description: Whether or not the receipts content should be returned
 *      - name: decode_operations
 *        in: query
 *        schema:
 *          type: boolean
 *        description: Whether or not the operations should be decoded
 *      - name: decode_events
 *        in: query
 *        schema:
 *          type: boolean
 *        description: Whether or not the events should be decoded
 *     responses:
 *       200:
 *        description: Block
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  block_id:
 *                    type: string
 *                  block_height:
 *                    type: string
 *                  block:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                      header:
 *                        type: object
 *                        properties:
 *                          previous:
 *                            type: string
 *                          height:
 *                            type: string
 *                          timestamp:
 *                            type: string
 *                          previous_state_merkle_root:
 *                            type: string
 *                          transaction_merkle_root:
 *                            type: string
 *                          signer:
 *                            type: string
 *                      signature:
 *                        type: string
 *                  receipt:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                      height:
 *                        type: string
 *                      network_bandwidth_used:
 *                        type: string
 *                      compute_bandwidth_used:
 *                        type: string
 *                      network_bandwidth_charged:
 *                        type: string
 *                      compute_bandwidth_charged:
 *                        type: string
 *            example:
 *            - block_id: "0x1220abe84016383095fde9ece4f0bee9cac4b371565eb9efb9827186d731bd5e6dac"
 *              block_height: "1"
 *              block:
 *                id: "0x1220abe84016383095fde9ece4f0bee9cac4b371565eb9efb9827186d731bd5e6dac"
 *                header:
 *                  previous: "0x12200000000000000000000000000000000000000000000000000000000000000000"
 *                  height: "1"
 *                  timestamp: "1667675722652"
 *                  previous_state_merkle_root: "EiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
 *                  transaction_merkle_root: "EiDjsMRCmPwcFJr79MiZb7kkJ65B5GSbk0yklZkbeFK4VQ=="
 *                  signer: "19XRaiEsjNmDn4pd498hRVkJ4ymtRTWsVZ"
 *                signature: "IDcDaVomEqOm3mmHbpyEUdBbomT8jyodKM-7ozfcfRsIBELv05LjAj7cAshQqV-1SUVe-ELW4k4gWEzQf8LPcfU="
 *              receipt:
 *                id: "0x1220abe84016383095fde9ece4f0bee9cac4b371565eb9efb9827186d731bd5e6dac"
 *                height: "1"
 *                network_bandwidth_used: "250"
 *                compute_bandwidth_used: "59653"
 *                network_bandwidth_charged: "250"
 *                compute_bandwidth_charged: "58900"
 *            - block_id: "0x1220fd14f45d8ea731770bc69a8d770626d38a5b4c3ee147b0f6e59cf9d5e213700b"
 *              block_height: "2"
 *              block:
 *                id: "0x1220fd14f45d8ea731770bc69a8d770626d38a5b4c3ee147b0f6e59cf9d5e213700b"
 *                header:
 *                  previous: "0x1220abe84016383095fde9ece4f0bee9cac4b371565eb9efb9827186d731bd5e6dac"
 *                  height: "2"
 *                  timestamp: "1667675727696"
 *                  previous_state_merkle_root: "EiAWTN1YPuSns2ueY-oPf7pw-JZr8OLU51xAcRI0Y7KhOQ=="
 *                  transaction_merkle_root: "EiDjsMRCmPwcFJr79MiZb7kkJ65B5GSbk0yklZkbeFK4VQ=="
 *                  signer: "19XRaiEsjNmDn4pd498hRVkJ4ymtRTWsVZ"
 *                signature: "HyU0hPabq-IniYy-L51H6yfbm3NWXD1LCWth7t50NH6dEMfdp84wsmlZ4HU7rConsW6xFfd3ebsRUKFydKUKASs="
 *              receipt:
 *                id: "0x1220fd14f45d8ea731770bc69a8d770626d38a5b4c3ee147b0f6e59cf9d5e213700b"
 *                height: "2"
 *                network_bandwidth_used: "250"
 *                compute_bandwidth_used: "59653"
 *                network_bandwidth_charged: "250"
 *                compute_bandwidth_charged: "58900"
 */

export async function GET(request: Request) {
  try {
    const provider = getProvider()

    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const limit = searchParams.get('limit')
    const return_block = searchParams.get('return_block') !== 'false'
    const return_receipt = searchParams.get('return_receipt') !== 'false'
    const decode_operations = searchParams.get('decode_operations') !== 'false'
    const decode_events = searchParams.get('decode_events') !== 'false'

    let blocks = await provider.call<{
      block_items: {
        block_id: string
        block_height: string
        block: BlockJson
        receipt: {
          events: EventData[]
          transaction_receipts: TransactionReceipt[]
        }
      }[]
    }>('block_store.get_blocks_by_height', {
      return_block,
      return_receipt,
      num_blocks: limit,
      ancestor_start_height: start,
      head_block_id: (await provider.getHeadInfo()).head_topology.id
    })

    if (!blocks.block_items.length) {
      throw new AppError('blocks do not exist')
    }

    blocks.block_items.forEach(async function(block: any) {
      if (block.receipt && decode_events) {
        if (block.receipt.events) {
          block.receipt.events = await decodeEvents(block.receipt.events)
        }

        if (block.receipt.transaction_receipts) {
          for (let index = 0; index < block.receipt.transaction_receipts.length; index++) {
            const receipt = block.receipt.transaction_receipts[index]
            if (receipt.events) {
              block.receipt.transaction_receipts[index].events = await decodeEvents(receipt.events)
            }
          }
        }
      }

      if (block.block && block.block.transactions && decode_operations) {
        for (let index = 0; index < block.block.transactions.length; index++) {
          const transaction = block.block.transactions[index]

          if (transaction.operations) {
            block.block.transactions[index].operations = await decodeOperations(
              transaction.operations
            )
          }
        }
      }
    })

    return Response.json(blocks.block_items)
  } catch (error) {
    return handleError(error as Error)
  }
}
