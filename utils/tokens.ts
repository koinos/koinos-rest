import { Contract } from 'koilib'
import ftAbi from '@/abis/ft.json'
import nftAbi from '@/abis/nft.json'
import { getProvider } from './providers'
import { fixAbi } from './contracts'

export function getTokenContract(id: string) {
  return new Contract({
    id,
    provider: getProvider(),
    // @ts-ignore
    abi: fixAbi(ftAbi)
  })
}

export function getNFTContract(id: string) {
  return new Contract({
    id,
    provider: getProvider(),
    // @ts-ignore
    abi: fixAbi(nftAbi)
  })
}
