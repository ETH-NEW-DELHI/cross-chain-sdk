import {Buffer} from 'buffer'
import {AddressLike, HexString} from './types.js'
import {AddressComplement} from './address-complement.js'
import {EvmAddress} from './evm-address.js'

export class OsmosisAddress implements AddressLike {
    public static readonly NATIVE = new OsmosisAddress('uosmo')
    public static readonly ZERO = new OsmosisAddress('osmo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0eht8c')

    constructor(private readonly address: string) {
        if (!this.isValidFormat(address)) {
            throw new Error(`Invalid Osmosis address format: ${address}`)
        }
    }

    static fromString(address: string): OsmosisAddress {
        return new OsmosisAddress(address)
    }

    static fromUnknown(address: unknown): OsmosisAddress {
        if (typeof address === 'string') {
            return new OsmosisAddress(address)
        }
        throw new Error(`Cannot create OsmosisAddress from: ${address}`)
    }

    private isValidFormat(address: string): boolean {
        return address === 'uosmo' || address.startsWith('osmo1')
    }

    public nativeAsZero(): OsmosisAddress {
        if (this.isNative()) {
            return OsmosisAddress.ZERO
        }
        return this
    }

    public zeroAsNative(): OsmosisAddress {
        if (this.isZero()) {
            return OsmosisAddress.NATIVE
        }
        return this
    }

    public toBuffer(): Buffer {
        return Buffer.from(this.address, 'utf8')
    }

    public toHex(): HexString {
        return ('0x' + this.toBuffer().toString('hex')) as HexString
    }

    public equal(other: AddressLike): boolean {
        return this.address === other.toString()
    }

    public isNative(): boolean {
        return this.address === 'uosmo'
    }

    public isZero(): boolean {
        return this.address === OsmosisAddress.ZERO.address
    }

    public toBigint(): bigint {
        return BigInt(this.toHex())
    }

    public toString(): string {
        return this.address
    }

    public toJSON(): string {
        return this.address
    }

    public splitToParts(): [AddressComplement, EvmAddress] {
        // For Osmosis addresses, we'll use a simple mapping
        return [AddressComplement.ZERO, EvmAddress.ZERO]
    }
}
