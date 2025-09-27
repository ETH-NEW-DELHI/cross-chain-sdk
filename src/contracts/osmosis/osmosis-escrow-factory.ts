import {SigningStargateClient} from '@cosmjs/stargate'
import {OsmosisAddress} from '../../domains/addresses/index.js'
import {OsmosisCrossChainOrder} from '../../cross-chain-order/osmosis/index.js'
import {Buffer} from 'buffer'

export class OsmosisEscrowFactory {
    constructor(
        private readonly client: SigningStargateClient,
        private readonly contractAddress: string
    ) {}

    /**
     * Create a new escrow order on Osmosis
     */
    async createOrder(order: OsmosisCrossChainOrder): Promise<string> {
        const msg = order.toCosmosMsg()
        
        // Update contract address
        msg.value.contract = this.contractAddress
        
        const result = await this.client.signAndBroadcast(
            order.maker.toString(),
            [msg],
            "auto"
        )
        
        return result.transactionHash
    }

    /**
     * Withdraw from escrow using secret
     */
    async withdrawEscrow(
        escrowAddress: string, 
        secret: string
    ): Promise<string> {
        const msg = {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: {
                sender: escrowAddress,
                contract: this.contractAddress,
                msg: Buffer.from(JSON.stringify({
                    withdraw: {
                        secret: secret
                    }
                }))
            }
        }

        const result = await this.client.signAndBroadcast(
            escrowAddress,
            [msg],
            "auto"
        )

        return result.transactionHash
    }

    /**
     * Cancel escrow order
     */
    async cancelEscrow(escrowAddress: string): Promise<string> {
        const msg = {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: {
                sender: escrowAddress,
                contract: this.contractAddress,
                msg: Buffer.from(JSON.stringify({
                    cancel: {}
                }))
            }
        }

        const result = await this.client.signAndBroadcast(
            escrowAddress,
            [msg],
            "auto"
        )

        return result.transactionHash
    }

    /**
     * Get escrow status
     */
    async getEscrowStatus(escrowAddress: string): Promise<any> {
        const queryMsg = {
            get_escrow: {
                address: escrowAddress
            }
        }

        const result = await this.client.queryContractSmart(
            this.contractAddress,
            queryMsg
        )

        return result
    }
}
