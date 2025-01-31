import { AppError } from '@/utils/errors'

export function requireParameters(searchParams: URLSearchParams, ...params: string[]) {
  for (var i = 0; i < params.length; i++) {
    if (!searchParams.has(params[i]))
      throw new AppError(`missing required field '${params[i]}'`)
  }
}
