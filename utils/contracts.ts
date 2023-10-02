import { config } from '@/app.config'
import { getKAPName } from '@/services/kap'
import { ProtoDescriptor, convert } from '@roamin/koinos-pb-to-proto'
import { interfaces, utils } from 'koilib'
import { Root, Type, parse } from 'protobufjs'
import { AppError } from './errors'
import { getAddress } from './addresses'

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

export function fixAbi(abi: interfaces.Abi): interfaces.Abi {
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

const nativeTypes = [
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
        if (!nativeTypes.includes(type)) {
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
    if (!nativeTypes.includes(type)) {
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