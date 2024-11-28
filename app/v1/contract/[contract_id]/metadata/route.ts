import { getContractId } from '@/utils/contracts'
import { handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'

/**
 * @swagger
 * /v1/contract/{contract_id}/metadata:
 *   get:
 *     tags: [Contracts]
 *     description: Returns the contract's metadata
 *     summary: Retrieves the metadata of the specified contract
 *     parameters:
 *      - name: contract_id
 *        schema:
 *          type: string
 *        in: path
 *        description: Koinos address of the contract, name of the contract (for system contracts) or KAP name
 *        required: true
 *        example: 15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL
 *     responses:
 *      200:
 *        description: Contract Metadata
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                contract_id:
 *                  type: string
 *                hash:
 *                  type: string
 *                system:
 *                  type: string
 *                authorizes_call_contract:
 *                  type: boolean
 *                authorizes_transaction_application:
 *                  type: boolean
 *                authorizes_upload_contract:
 *                  type: boolean
 *            example:
 *              contract_id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
 *              hash: '0x1220c57e3573189868970a3a1662a667c366b15015d9b7900ffed415c5e944036e88'
 *              system: true
 *              authorizes_call_contract: true
 *              authorizes_transaction_application: true
 *              authorizes_upload_contract: true
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const provider = getProvider()

    const {value: metadataRes} = await provider.invokeGetContractMetadata(contract_id)

    return Response.json({ contract_id, ...metadataRes })
  } catch (error) {
    return handleError(error as Error)
  }
}
