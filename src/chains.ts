import {TupleToUnion} from './type-utils.js'

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    ZKSYNC = 324,
    BINANCE = 56,
    ARBITRUM = 42161,
    AVALANCHE = 43114,
    OPTIMISM = 10,
    FANTOM = 250,
    GNOSIS = 100,
    COINBASE = 8453,
    LINEA = 59144,
    SONIC = 146,
    UNICHAIN = 130,
    SOLANA = 501,
    OSMOSIS_TESTNET = 1000,
    OSMOSIS_MAINNET = 1001
}

export const SupportedChains = [
    NetworkEnum.ETHEREUM,
    NetworkEnum.POLYGON,
    NetworkEnum.BINANCE,
    NetworkEnum.OPTIMISM,
    NetworkEnum.ARBITRUM,
    NetworkEnum.AVALANCHE,
    NetworkEnum.GNOSIS,
    NetworkEnum.COINBASE,
    NetworkEnum.ZKSYNC,
    NetworkEnum.LINEA,
    NetworkEnum.SONIC,
    NetworkEnum.UNICHAIN,
    NetworkEnum.SOLANA,
    NetworkEnum.OSMOSIS_TESTNET,
    NetworkEnum.OSMOSIS_MAINNET
] as const

type UnsupportedChain = Exclude<
    NetworkEnum,
    TupleToUnion<typeof SupportedChains>
>

export type SupportedChain = Exclude<NetworkEnum, UnsupportedChain>
export type EvmChain = Exclude<SupportedChain, NetworkEnum.SOLANA | NetworkEnum.OSMOSIS_TESTNET | NetworkEnum.OSMOSIS_MAINNET>
export type SolanaChain = NetworkEnum.SOLANA
export type CosmosChain = NetworkEnum.OSMOSIS_TESTNET | NetworkEnum.OSMOSIS_MAINNET
export type OsmosisChain = CosmosChain

export const isSupportedChain = (chain: unknown): chain is SupportedChain =>
    SupportedChains.includes(chain as number)

export const isEvm = (chain: SupportedChain): chain is EvmChain => {
    return (
        SupportedChains.includes(chain as number) &&
        chain !== NetworkEnum.SOLANA &&
        chain !== NetworkEnum.OSMOSIS_TESTNET &&
        chain !== NetworkEnum.OSMOSIS_MAINNET
    )
}

export const isSolana = (chain: SupportedChain): chain is SolanaChain => {
    return chain === NetworkEnum.SOLANA
}

export const isCosmos = (chain: SupportedChain): chain is CosmosChain => {
    return chain === NetworkEnum.OSMOSIS_TESTNET || chain === NetworkEnum.OSMOSIS_MAINNET
}

export const isOsmosis = (chain: SupportedChain): chain is OsmosisChain => {
    return isCosmos(chain)
}
