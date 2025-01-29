import { getContract, getContractId } from '@/utils/contracts'
import { AppError, getErrorMessage } from '@/utils/errors'

function findTypeInTypes(typename: string, types: any) : any {
  if (types[typename])
    return types[typename]
  else if (types.nested)
    return findTypeInTypes(typename, types.nested)

  return undefined
}

function findTypeFromABI(typename: string, abi: any) : any {
  if (typename[0] == '.')
    typename = typename.substring(1);

  const namespaceTokens = typename.split('.')

  if (namespaceTokens.length > 1) {
    let typeDef = abi.koilib_types

    for (const token of namespaceTokens) {
      typeDef = findTypeInTypes(token, typeDef)

      if (!typeDef)
        return typeDef
    }

    return typeDef
  }

  return findTypeInTypes(typename, abi.koilib_types)
}


function protoTypeToSwaggerType(type: any, abi: any) : any {
  let result : any = {};

  for (const [key, value] of (Object.entries(type.fields) as [any])) {
    let swaggerType: any = {}

    switch (value.type) {
      case "int32":
      case "uint32":
      case "sint32":
      case "fixed32":
      case "sfixed32":
      {
        swaggerType.type = "integer";
        swaggerType.format = "int32";
        break;
      }
      case "int64":
      case "uint64":
      case "sint64":
      case "fixed64":
      case "sfixed64":
      {
        swaggerType.type = "string";
        break;
      }
      case "bool":
      {
        swaggerType.type = "boolean";
        break;
      }
      case "string":
      case "bytes":
      {
        swaggerType.type = "string";
        break;
      }
      case "double":
      case "float":
        throw new AppError("Koinos does not support floating points in smart contracts");
      default:
      {
        const fieldType = findTypeFromABI(value.type, abi)

        if (fieldType && fieldType.properties)
        {
          // Object case
          swaggerType.properties = protoTypeToSwaggerType(fieldType, abi);
          swaggerType.type = "object"
        }
        else if (fieldType && fieldType.values)
        {
          // Enum case
          swaggerType.type = "string"
        }

        break;
      }
    }

    if (value.rule && value.rule == "repeated") {
      swaggerType = {
        type: "array",
        items: swaggerType
      }
    }

    result[key] = swaggerType;
  }

  return result;
}

export async function getContractSwagger(contract_id: string) : Promise< any >
{
  try {
    const contract_address = await getContractId(contract_id)
    const contract = (await getContract(contract_address) as any)

    let result = {
      openapi: "3.0.0",
      info: {
        title: `'${contract_id}' REST API`,
        version: "1.0.0",
      },
      tags: [
        {
          name: "Contracts",
          description: `Includes endpoints for interacting with the '${contract_id}' contract on Koinos`,
        }
      ],
      paths: {}
    }

    for (const [key, value] of (Object.entries(contract.abi.methods) as [any]))
    {
      const description = (value as any).read_only ?
        `Call '${key}' and return the result.` :
        `Returns the operation for calling '${key}'.`;

      (result.paths as any)[`/v1/contract/${contract_id}/${key}`] = {
        get : {
          tags: ["Contracts"],
          description,
          parameters: []
        },
        post: {
          tags: ["Contracts"],
          description
        }
      }

      let method = (result.paths as any)[`/v1/contract/${contract_id}/${key}`];

      const argsType = findTypeFromABI(value.argument, contract.abi);

      if (!argsType || !argsType.fields)
        continue;

      const swaggerType = protoTypeToSwaggerType(argsType, contract.abi);

      for (const [fieldName, fieldType] of (Object.entries(swaggerType))) {
        method.get.parameters.push({
          name: fieldName,
          in: "query",
          schema: fieldType
        });
      }

      method.post.requestBody = {
        description: `Arguments for the method '${key}'`,
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: swaggerType,
            }
          }
        }
      }

      let responses : any;

      if (!(value as any).read_only)
      {
        responses = {
          "200": {
            description: `Operation for calling '${key}'`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    call_contract: {
                      type: "object",
                      properties: {
                        contract_id: {
                          type: "string"
                        },
                        entry_point: {
                          type: "integer"
                        },
                        args: {
                          type: "string"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      else
      {
        const retType = findTypeFromABI(value.return, contract.abi);
        const swaggerType = protoTypeToSwaggerType(retType, contract.abi);

        responses = {
          "200": {
            description: `Result of calling '${key}'`,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: swaggerType
                }
              }
            }
          }
        }
      }

      method.get.responses = responses
      method.post.responses = responses
    }

    return result
  } catch (error) {
    throw new AppError(getErrorMessage(error as Error))
  }
}