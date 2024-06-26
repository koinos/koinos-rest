import { OperationJson } from 'koilib'
import { getContract } from './contracts'

export async function decodeOperations(operations: OperationJson[]) {
  for (let index = 0; index < operations.length; index++) {
    const operation = operations[index]
    if (operation.call_contract) {
      const contract = await getContract(operation.call_contract.contract_id, false)

      if (contract && contract.functions) {
        try {
          const decodedOp = await contract.decodeOperation(operation)

          operations[index] = {
            call_contract: {
              contract_id: operation.call_contract.contract_id,
              // @ts-ignore override type
              entry_point: decodedOp.name,
              // @ts-ignore override type
              args: decodedOp.args
            }
          }
        } catch (error) {
          // ignore decoding errors
        }
      }
    }
  }

  return operations
}
