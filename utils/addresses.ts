import { getKAPName } from '@/services/kap'
import { Serializer, utils } from 'koilib'
import { AppError } from './errors'
import { getProvider } from './providers'
import { resolveNickname } from '@/services/nicknames'

let contractAddresses: Record<string, string> = {};

export async function getAddress(str: string) {
  if (contractAddresses[str]) {
    return contractAddresses[str];
  }

  // system contracts
  const contract = await getSystemAddress(str);

  if (contract) {
    contractAddresses[str] = contract;
    return contract;
  }

  // kap names
  if (str.endsWith('.koin')) {
    const kapName = await getKAPName(str)

    if (kapName) {
      contractAddresses[str] = kapName.owner;
      return kapName.owner
    }
  }

  // nicknames
  else if (str.startsWith('@')) {
    const address = await resolveNickname(str)
    if (address) {
      contractAddresses[str] = address;
      return address
    }
  }

  return str
}

export async function getAccountAddress(str: string) {
  let address = str

  if (!address) {
    throw new AppError('missing account')
  }

  address = await getAddress(address)

  try {
    if (!utils.isChecksumAddress(address)) {
      throw new AppError('invalid account')
    }
  } catch (error) {
    throw new AppError('invalid account')
  }

  return address
}

export async function getSystemAddress(str: string): Promise<string | undefined> {
  const provider = getProvider()

  const serializer = new Serializer(
    {
      nested: {
        get_address_arguments: {
          fields: {
            name: {
              type: "string",
              id: 1,
            },
          },
        },
        get_address_result: {
          fields: {
            value: {
              type: "address_record",
              id: 1,
            },
          },
        },
        address_record: {
          fields: {
            name: {
              type: "bytes",
              id: 1,
              options: {
                "(koinos.btype)": "ADDRESS",
              },
            },
          },
        },
      },
    },
    {
      argumentsTypeName: "get_address_arguments",
      returnTypeName: "get_address_result",
    }
  );

  try {
    let res = await provider.invokeSystemCall(serializer, 10001, {"name": str});

    if ((res["value"] as any)["name"]) {
      return String((res["value"] as any)["name"]);
    }
  } catch (error) {}

  return
}