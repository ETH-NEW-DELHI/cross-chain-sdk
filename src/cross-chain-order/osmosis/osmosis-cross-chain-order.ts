import {BaseOrder} from '../base-order.js'
import {OsmosisAddress} from '../../domains/addresses/index.js'
import {HashLock} from '../../domains/hash-lock/index.js'
import {TimeLocks} from '../../domains/time-locks/index.js'
import {AuctionDetails} from '../../domains/auction-details/index.js'
import {NetworkEnum, CosmosChain} from '../../chains.js'
import {AuctionCalculator} from '@1inch/fusion-sdk'
import {Buffer} from 'buffer'
import {createHash} from 'node:crypto'
import {
    OsmosisCrossChainOrderInfo,
    OsmosisEscrowParams,
    OsmosisDetails,
    OsmosisOrderJSON
} from './types.js'

export class OsmosisCrossChainOrder extends BaseOrder<
    OsmosisAddress,
    OsmosisOrderJSON
> {
    public readonly hashLock: HashLock
    public readonly timeLocks: TimeLocks
    public readonly srcSafetyDeposit: bigint
    public readonly dstSafetyDeposit: bigint
    public readonly dstChainId: NetworkEnum
    public readonly maker: OsmosisAddress
    public readonly takerAsset: OsmosisAddress
    public readonly makerAsset: OsmosisAddress
    public readonly takingAmount: bigint
    public readonly makingAmount: bigint
    public readonly receiver: OsmosisAddress
    public readonly deadline: bigint
    public readonly auctionStartTime: bigint
    public readonly auctionEndTime: bigint
    public readonly partialFillAllowed: boolean
    public readonly multipleFillsAllowed: boolean
    public readonly srcAssetIsNative: boolean
    public readonly salt: bigint

    constructor(
        orderInfo: OsmosisCrossChainOrderInfo,
        escrowParams: OsmosisEscrowParams,
        details: OsmosisDetails
    ) {
        super()
        
        this.makerAsset = orderInfo.makerAsset
        this.takerAsset = orderInfo.takerAsset as OsmosisAddress
        this.makingAmount = orderInfo.makingAmount
        this.takingAmount = orderInfo.takingAmount
        this.maker = orderInfo.maker
        this.receiver = (orderInfo.receiver as OsmosisAddress) || this.maker
        this.salt = orderInfo.salt || 0n
        
        this.hashLock = escrowParams.hashLock
        this.timeLocks = escrowParams.timeLocks
        this.srcSafetyDeposit = escrowParams.srcSafetyDeposit
        this.dstSafetyDeposit = escrowParams.dstSafetyDeposit
        this.dstChainId = escrowParams.dstChainId
        
        this.srcAssetIsNative = orderInfo.makerAsset.isNative()
        
        // Calculate auction times
        this.auctionStartTime = details.auction.startTime
        this.auctionEndTime = details.auction.endTime
        this.deadline = this.auctionEndTime + 12n // 12 second buffer
        
        this.partialFillAllowed = true
        this.multipleFillsAllowed = true
    }

    static new(
        orderInfo: OsmosisCrossChainOrderInfo,
        escrowParams: OsmosisEscrowParams,
        details: OsmosisDetails
    ): OsmosisCrossChainOrder {
        return new OsmosisCrossChainOrder(orderInfo, escrowParams, details)
    }

    /**
     * Convert order to Cosmos SDK message format
     */
    toCosmosMsg(): any {
        return {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: {
                sender: this.maker.toString(),
                contract: 'osmo1contract...', // Will be set by factory
                msg: Buffer.from(JSON.stringify({
                    create_escrow: {
                        hash_lock: this.hashLock.toString(),
                        time_lock: this.timeLocks.toString(),
                        maker: this.maker.toString(),
                        maker_asset: this.makerAsset.toString(),
                        making_amount: this.makingAmount.toString(),
                        taker_asset: this.takerAsset.toString(),
                        taking_amount: this.takingAmount.toString(),
                        receiver: this.receiver.toString(),
                        deadline: this.deadline.toString(),
                        safety_deposit: this.srcSafetyDeposit.toString()
                    }
                }))
            }
        }
    }

    getOrderHash(srcChainId: NetworkEnum): string {
        const buffer = this.getOrderHashBuffer(srcChainId)
        return '0x' + buffer.toString('hex')
    }

    getOrderHashBuffer(srcChainId: NetworkEnum): Buffer {
        const data = {
            srcChainId,
            dstChainId: this.dstChainId,
            maker: this.maker.toString(),
            makerAsset: this.makerAsset.toString(),
            makingAmount: this.makingAmount.toString(),
            takerAsset: this.takerAsset.toString(),
            takingAmount: this.takingAmount.toString(),
            receiver: this.receiver.toString(),
            hashLock: this.hashLock.toString(),
            timeLocks: this.timeLocks.toString(),
            deadline: this.deadline.toString(),
            salt: this.salt.toString()
        }
        
        const hash = createHash('sha256')
        hash.update(JSON.stringify(data))
        return hash.digest()
    }

    getCalculator(): AuctionCalculator {
        // Return a basic calculator for now
        // This will be enhanced in future commits
        return {
            calcRateBump: () => 0n,
            calcAuctionTakingAmount: (amount: bigint) => amount
        } as AuctionCalculator
    }

    toJSON(): OsmosisOrderJSON {
        return {
            makerAsset: this.makerAsset.toString(),
            takerAsset: this.takerAsset.toString(),
            makingAmount: this.makingAmount.toString(),
            takingAmount: this.takingAmount.toString(),
            maker: this.maker.toString(),
            salt: this.salt.toString(),
            receiver: this.receiver.toString(),
            hashLock: this.hashLock.toString(),
            timeLocks: this.timeLocks.toString(),
            srcSafetyDeposit: this.srcSafetyDeposit.toString(),
            dstSafetyDeposit: this.dstSafetyDeposit.toString(),
            srcChainId: this.dstChainId, // Note: This will be corrected in future commits
            dstChainId: this.dstChainId,
            deadline: this.deadline.toString(),
            auctionStartTime: this.auctionStartTime.toString(),
            auctionEndTime: this.auctionEndTime.toString(),
            partialFillAllowed: this.partialFillAllowed,
            multipleFillsAllowed: this.multipleFillsAllowed,
            srcAssetIsNative: this.srcAssetIsNative
        }
    }
}
