import {AuctionDetails} from '../../domains/auction-details/index.js'
import {AddressLike, OsmosisAddress} from '../../domains/addresses/index.js'
import {HashLock} from '../../domains/hash-lock/index.js'
import {TimeLocks} from '../../domains/time-locks/index.js'
import {CosmosChain, SupportedChain} from '../../chains.js'

export type OsmosisCrossChainOrderInfo = {
    /**
     * Source chain asset (Osmosis)
     */
    makerAsset: OsmosisAddress
    /**
     * Destination chain asset
     */
    takerAsset: AddressLike
    /**
     * Source chain amount
     */
    makingAmount: bigint
    /**
     * Destination chain min amount
     */
    takingAmount: bigint
    maker: OsmosisAddress
    salt?: bigint
    /**
     * Destination chain receiver address
     *
     * If not set, then `maker` used
     */
    receiver?: AddressLike
}

export type OsmosisExtra = {
    /**
     * Order will expire in `orderExpirationDelay` after auction ends
     * Default 12s
     */
    orderExpirationDelay?: bigint
    /**
     * Source asset is native OSMO token
     */
    srcAssetIsNative?: boolean
    /**
     * Allow multiple fills for this order
     */
    allowMultipleFills?: boolean
    /**
     * Allow partial fills for this order
     */
    allowPartialFills?: boolean
    /**
     * Source identifier for tracking
     */
    source?: string
}

export type OsmosisDetails = {
    auction: AuctionDetails
}

export type OsmosisEscrowParams = {
    hashLock: HashLock
    srcChainId: CosmosChain
    dstChainId: SupportedChain
    srcSafetyDeposit: bigint
    dstSafetyDeposit: bigint
    timeLocks: TimeLocks
}

export type OsmosisOrderJSON = {
    makerAsset: string
    takerAsset: string
    makingAmount: string
    takingAmount: string
    maker: string
    salt?: string
    receiver?: string
    hashLock: string
    timeLocks: string
    srcSafetyDeposit: string
    dstSafetyDeposit: string
    srcChainId: number
    dstChainId: number
    deadline: string
    auctionStartTime: string
    auctionEndTime: string
    partialFillAllowed: boolean
    multipleFillsAllowed: boolean
    srcAssetIsNative: boolean
}
