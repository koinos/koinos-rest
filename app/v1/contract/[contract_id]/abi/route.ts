import { fixAbi, getContractId } from '@/utils/contracts'
import { AppError, handleError } from '@/utils/errors'
import { getProvider } from '@/utils/providers'
import { Abi } from 'koilib'

/**
 * @swagger
 * /v1/contract/{contract_id}/abi:
 *   get:
 *     tags: [Contracts]
 *     description: Returns the contract's ABI
 *     summary: Retrieves the ABI (Application Binary Interface) of the specified contract, detailing its methods and protobuf definitions.
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
 *        description: Contract Abi
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ContractAbi'
 *            example:
 *              contract_id: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL"
 *              abi:
 *                methods:
 *                  name:
 *                    argument: "koinos.contracts.token.name_arguments"
 *                    return: "koinos.contracts.token.name_result"
 *                    entry-point: "0x82a3537f"
 *                    description: "Returns the token name"
 *                    read-only: true
 *                    entry_point: 2191741823
 *                    read_only: true
 *                  # ... (other methods)
 *                types: "CpUJCiJrb2lub3Mv..."
 *                koilib_types:
 *                  nested:
 *                    koinos:
 *                      nested:
 *                        contracts:
 *                          nested:
 *                            token:
 *                              nested:
 *                                name_arguments:
 *                                  fields: {}
 *                                # ... (other types)
 */

export async function GET(request: Request, { params }: { params: { contract_id: string } }) {
  try {
    const contract_id = await getContractId(params.contract_id)
    const provider = getProvider()

    const response = await provider.call<{ meta?: { abi: string } }>(
      'contract_meta_store.get_contract_meta',
      {
        contract_id
      }
    )

    if (!response.meta) {
      throw new AppError(`abi not available for contract ${contract_id}`)
    }

    let abi: Abi = {
      ...JSON.parse(response.meta.abi)
    }

    abi = fixAbi(abi)

    return Response.json({ contract_id, ...response.meta, abi })
  } catch (error) {
    return handleError(error as Error)
  }
}
