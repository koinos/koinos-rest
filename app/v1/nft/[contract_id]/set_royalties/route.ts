import { getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage, handleError } from '@/utils/errors'
import { getNFTContract } from '@/utils/tokens'

/**
 * @swagger
 * /v1/nft/{contract_id}/set_royalties:
 *   post:
 *     tags: [Non Fungible Tokens]
 *     description: Sets the royalties of the collection, returning the operation.
 *     summary: Sets the royalties of the collection, returning the operation.
 *     parameters:
 *      - name: contract_id
 *        in: path
 *        schema:
 *          type: string
 *        description: Koinos address of the contract
 *        required: true
 *        example: "@koinos.fun"
 *     requestBody:
 *       description: Arguments for the method call
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: array
 *                 items:
 *                   type: struct
 *                   properties:
 *                     percentage:
 *                       type: string
 *                     address:
 *                       type: string
 *           example:
 *             value:
 *             - percentage: 2500
 *               address: 1EnaBDVTA5hqXokC2dDzt2JT5eHv1y7ff1
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
 *                entry_point: 995865963
 *                args: "Ch4IxBMSGQCXOAwpU-iVYEPmVZQzvKopy515EHdX9KQ="
 */
export async function POST(
    request: Request,
    { params }: { params: { contract_id: string; } }
  ) {
    try {
      const contract_id = await getContractId(params.contract_id)
      const contract = await getNFTContract(contract_id)

      let args = await request.json()

      try {
        return Response.json(await contract.encodeOperation({
          name: 'set_royalties',
          args
        }))
      } catch (error) {
        throw new AppError(getErrorMessage(error as Error))
      }
    } catch (error) {
      return handleError(error as Error)
    }
  }