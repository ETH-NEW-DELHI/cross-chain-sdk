import {describe, it, expect} from 'jest'
import {
    OsmosisAddress,
    OsmosisCrossChainOrder,
    OsmosisCrossChainOrderInfo,
    OsmosisEscrowParams,
    OsmosisDetails,
    NetworkEnum,
    isCosmos,
    isOsmosis
} from '../src/index.js'
import {HashLock} from '../src/domains/hash-lock/index.js'
import {TimeLocks} from '../src/domains/time-locks/index.js'
import {AuctionDetails} from '../src/domains/auction-details/index.js'

describe('Osmosis Integration', () => {
    it('should create OsmosisAddress correctly', () => {
        const address = OsmosisAddress.fromString('osmo1abc123def456')
        expect(address.toString()).toBe('osmo1abc123def456')
        expect(address.isNative()).toBe(false)
        expect(address.isZero()).toBe(false)
    })

    it('should handle native OSMO token', () => {
        const native = OsmosisAddress.NATIVE
        expect(native.toString()).toBe('uosmo')
        expect(native.isNative()).toBe(true)
    })

    it('should detect Cosmos chains correctly', () => {
        expect(isCosmos(NetworkEnum.OSMOSIS_TESTNET)).toBe(true)
        expect(isCosmos(NetworkEnum.OSMOSIS_MAINNET)).toBe(true)
        expect(isCosmos(NetworkEnum.ETHEREUM)).toBe(false)
        expect(isCosmos(NetworkEnum.SOLANA)).toBe(false)
    })

    it('should detect Osmosis chains correctly', () => {
        expect(isOsmosis(NetworkEnum.OSMOSIS_TESTNET)).toBe(true)
        expect(isOsmosis(NetworkEnum.OSMOSIS_MAINNET)).toBe(true)
        expect(isOsmosis(NetworkEnum.ETHEREUM)).toBe(false)
    })

    it('should create OsmosisCrossChainOrder', () => {
        const orderInfo: OsmosisCrossChainOrderInfo = {
            makerAsset: OsmosisAddress.NATIVE,
            takerAsset: OsmosisAddress.fromString('osmo1def456'),
            makingAmount: 1000000n,
            takingAmount: 2000000n,
            maker: OsmosisAddress.fromString('osmo1maker123'),
            receiver: OsmosisAddress.fromString('osmo1receiver456')
        }

        const escrowParams: OsmosisEscrowParams = {
            hashLock: HashLock.forSingleFill('0x1234'),
            srcChainId: NetworkEnum.OSMOSIS_TESTNET,
            dstChainId: NetworkEnum.ETHEREUM,
            srcSafetyDeposit: 10000n,
            dstSafetyDeposit: 20000n,
            timeLocks: TimeLocks.new(3600n, 1800n, 900n, 300n)
        }

        const details: OsmosisDetails = {
            auction: AuctionDetails.new({
                startTime: 1000000n,
                duration: 3600n,
                initialRateBump: 100n,
                finalRateBump: 200n,
                initialRate: 1000000n,
                finalRate: 2000000n
            })
        }

        const order = OsmosisCrossChainOrder.new(orderInfo, escrowParams, details)

        expect(order.maker.toString()).toBe('osmo1maker123')
        expect(order.makingAmount).toBe(1000000n)
        expect(order.takingAmount).toBe(2000000n)
        expect(order.srcAssetIsNative).toBe(true)
    })

    it('should generate order hash', () => {
        const orderInfo: OsmosisCrossChainOrderInfo = {
            makerAsset: OsmosisAddress.NATIVE,
            takerAsset: OsmosisAddress.fromString('osmo1def456'),
            makingAmount: 1000000n,
            takingAmount: 2000000n,
            maker: OsmosisAddress.fromString('osmo1maker123')
        }

        const escrowParams: OsmosisEscrowParams = {
            hashLock: HashLock.forSingleFill('0x1234'),
            srcChainId: NetworkEnum.OSMOSIS_TESTNET,
            dstChainId: NetworkEnum.ETHEREUM,
            srcSafetyDeposit: 10000n,
            dstSafetyDeposit: 20000n,
            timeLocks: TimeLocks.new(3600n, 1800n, 900n, 300n)
        }

        const details: OsmosisDetails = {
            auction: AuctionDetails.new({
                startTime: 1000000n,
                duration: 3600n,
                initialRateBump: 100n,
                finalRateBump: 200n,
                initialRate: 1000000n,
                finalRate: 2000000n
            })
        }

        const order = OsmosisCrossChainOrder.new(orderInfo, escrowParams, details)
        const orderHash = order.getOrderHash(NetworkEnum.OSMOSIS_TESTNET)

        expect(orderHash).toMatch(/^0x[a-f0-9]{64}$/)
    })

    it('should serialize to JSON', () => {
        const orderInfo: OsmosisCrossChainOrderInfo = {
            makerAsset: OsmosisAddress.NATIVE,
            takerAsset: OsmosisAddress.fromString('osmo1def456'),
            makingAmount: 1000000n,
            takingAmount: 2000000n,
            maker: OsmosisAddress.fromString('osmo1maker123')
        }

        const escrowParams: OsmosisEscrowParams = {
            hashLock: HashLock.forSingleFill('0x1234'),
            srcChainId: NetworkEnum.OSMOSIS_TESTNET,
            dstChainId: NetworkEnum.ETHEREUM,
            srcSafetyDeposit: 10000n,
            dstSafetyDeposit: 20000n,
            timeLocks: TimeLocks.new(3600n, 1800n, 900n, 300n)
        }

        const details: OsmosisDetails = {
            auction: AuctionDetails.new({
                startTime: 1000000n,
                duration: 3600n,
                initialRateBump: 100n,
                finalRateBump: 200n,
                initialRate: 1000000n,
                finalRate: 2000000n
            })
        }

        const order = OsmosisCrossChainOrder.new(orderInfo, escrowParams, details)
        const json = order.toJSON()

        expect(json.maker).toBe('osmo1maker123')
        expect(json.makerAsset).toBe('uosmo')
        expect(json.makingAmount).toBe('1000000')
        expect(json.takingAmount).toBe('2000000')
        expect(json.srcChainId).toBe(NetworkEnum.ETHEREUM)
        expect(json.dstChainId).toBe(NetworkEnum.ETHEREUM)
    })
})
