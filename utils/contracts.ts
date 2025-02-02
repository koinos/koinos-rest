import { ProtoDescriptor, convert } from '@roamin/koinos-pb-to-proto'
import { Abi, Contract, utils } from 'koilib'
import { Root, Type, parse } from 'protobufjs'
import { AppError } from './errors'
import { getAddress } from './addresses'
import { getProvider } from './providers'
import { config } from '@/app.config'
import KapAbi from '@/abis/kap.json'
import { createRedisInstance } from '@/utils/redis'

const redis = createRedisInstance()

export async function getContractId(str: string) {
  let contract_id = str

  if (!contract_id) {
    throw new AppError('missing contract_id')
  }

  contract_id = await getAddress(contract_id)

  try {
    if (!utils.isChecksumAddress(contract_id)) {
      throw new AppError('invalid contract_id')
    }
  } catch (error) {
    throw new AppError('invalid contract_id')
  }

  return contract_id
}

export function fixAbi(abi: Abi): Abi {
  Object.keys(abi.methods).forEach((name) => {
    abi.methods[name] = {
      ...abi!.methods[name]
    }

    //@ts-ignore this is needed to be compatible with "old" abis
    if (abi.methods[name]['entry-point']) {
      //@ts-ignore this is needed to be compatible with "old" abis
      abi.methods[name].entry_point = parseInt(abi.methods[name]['entry-point'])
    }

    //@ts-ignore this is needed to be compatible with "old" abis
    if (abi.methods[name]['read-only'] !== undefined) {
      //@ts-ignore this is needed to be compatible with "old" abis
      abi.methods[name].read_only = abi.methods[name]['read-only']
    }
  })

  if (!abi.koilib_types && abi.types) {
    const protos = convert(abi.types)
    const root = parseProtos(protos)
    abi.koilib_types = root.toJSON()
  }

  return abi
}

function parseProtos(protos: ProtoDescriptor[]): Root {
  const root = new Root()
  for (const proto of protos) {
    try {
      parse(proto.definition, root, { keepCase: true })
    } catch (e) {
      continue
    }
  }
  return root
}

async function processBType(value: unknown, bType: string): Promise<unknown> {
  switch (bType) {
    case 'CONTRACT_ID':
    case 'ADDRESS':
      return await getAddress(value as string)
    default:
      return value
  }
}

const NATIVE_PROTO_TYPES = [
  'double',
  'float',
  'int32',
  'int64',
  'uint32',
  'uint64',
  'sint32',
  'sint64',
  'fixed32',
  'fixed64',
  'sfixed32',
  'sfixed64',
  'bool',
  'string',
  'bytes'
]

export async function processArgs(
  args: Record<string, unknown>,
  protoRoot?: Root,
  argsProto?: Type
): Promise<Record<string, unknown>> {
  if (!protoRoot || !argsProto) {
    return args
  }

  const keys = Object.keys(argsProto.fields)

  for (let index = 0; index < keys.length; index++) {
    const fieldName = keys[index]

    // @ts-ignore
    const { options, name, type, rule } = argsProto.fields[fieldName]
    if (!args[name]) continue

    let bType = ''
    if (options) {
      if (options['(btype)']) {
        bType = options['(btype)']
      } else if (options['(koinos.btype)']) {
        bType = options['(koinos.btype)']
      }
    }

    // arrays
    if (rule === 'repeated') {
      args[name] = (args[name] as unknown[]).map(async (item) => {
        // custom objects
        if (!NATIVE_PROTO_TYPES.includes(type)) {
          const protoBuf = protoRoot.lookupTypeOrEnum(type)
          if (!protoBuf.fields) {
            // it's an enum
            return item
          }
          return await processArgs(item as Record<string, unknown>, protoRoot, protoBuf)
        }

        // native types
        return item
      })

      continue
    }

    // custom objects
    if (!NATIVE_PROTO_TYPES.includes(type)) {
      const protoBuf = protoRoot.lookupTypeOrEnum(type)
      if (!protoBuf.fields) {
        // it's an enum
        continue
      }
      args[name] = await processBType(args[name], bType)
      continue
    }

    // native types
    args[name] = await processBType(args[name], bType)
  }

  return args
}

let CONTRACTS_CACHE: Record<string, Contract> | undefined

function getContractsCache(contractId: string): Contract | undefined {
  if (!CONTRACTS_CACHE) {
    CONTRACTS_CACHE = {
      [config.contracts.kap]: new Contract({
        id: config.contracts.kap,
        // @ts-ignore abi is compatible
        abi: KapAbi,
        provider: getProvider()
      })
    }
  }

  return CONTRACTS_CACHE[contractId]
}

function setContractsCache(contractId: string, contract: Contract) {
  CONTRACTS_CACHE![contractId] = contract
}

async function getRedisCache(contractId: string) {
  if (!redis) return

  const redisContractAbi = await redis.get(contractId)

  if (redisContractAbi) {
    const contract = new Contract({
      id: contractId,
      abi: JSON.parse(redisContractAbi),
      provider: getProvider()
    })

    return contract
  }
}

async function setRedisCache(contractId: string, contract: Contract) {
  if (!redis) return
  try {
    await redis.set(contractId, JSON.stringify(contract.abi), 'EX', 60)
  } catch (err) {
    console.error('Error setting contract in cache:', err)
  }
}

export async function getContract(contractId: string, throwIfAbiMissing = true) {
  let contract = getContractsCache(contractId)

  if (contract) {
    if (throwIfAbiMissing && !contract.abi) {
      throw new AppError(`abi not available for contract ${contractId}`)
    }

    return contract
  }

  // Check Redis cache for contract abi with the contractId key
  contract = await getRedisCache(contractId)

  if (contract) {
    if (throwIfAbiMissing && !contract?.abi) {
      throw new AppError(`abi not available for contract ${contractId}`)
    }
    return contract
  }

  contract = new Contract({
    id: contractId,
    provider: getProvider()
  })

  // fetch abi from node
  let abi = await contract.fetchAbi({
    updateFunctions: false,
    updateSerializer: false
  })

  if (throwIfAbiMissing && !abi) {
    throw new AppError(`abi not available for contract ${contractId}`)
  }

  if (abi) {
    // fix abi incompatibilities
    abi = fixAbi(abi)

    contract = new Contract({
      id: contractId,
      provider: getProvider(),
      abi
    })
  }

  await setRedisCache(contractId, contract)
  setContractsCache(contractId, contract)

  return contract
}
