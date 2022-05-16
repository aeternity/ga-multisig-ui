<template>
  <div class="resume" v-if="isCurrentUserSigner">
    <h2>Resume</h2>
    <!--    todo merge resume and create-->
    <propose-form
      :recipient-key="recipientKey"
      :proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>
    <confirm-form
      v-if="hasProposedTx"
      @confirm-clicked="confirmTx"
      @revoke-clicked="revokeTx"/>
    <send-form
      v-if="hasConsensus"
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
  </div>
  <div v-else>
    Sorry you are not on the signer list
  </div>
</template>

<script>
import { aeWallet, buildAuthTxHash } from '../utils/aeternity'
import { multisig } from '../store'
import { updateContractInfo } from '../store'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import {
  MemoryAccount,
  Node,
  Universal,
} from '@aeternity/aepp-sdk'


import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { COMPILER_URL } from "../utils/aeternity/configs"


export default {
  name: 'Resume',
  components: { SendForm, ConfirmForm, ProposeForm },
  data: () => ({
    signerSdk: null,
    contractAccount: null,
    contractInstance: null,
  }),
  computed: {
    recipientKey () {
      return multisig.recipientKey
    },
    proposedAmount () {
      return multisig.proposedAmount
    },
    isCurrentUserSigner () {
      return multisig.isCurrentUserSigner
    },
    hasProposedTx () {
      return multisig.hasProposedTx
    },
    hasConsensus () {
      return multisig.hasConsensus
    },
    gaPubKey () {
      return multisig.gaPubKey
    },
    txHash () {
      return multisig.txHash
    },
    gaSecret () {
      return multisig.gaSecret
    },
  },
  async mounted () {
    this.signerSdk = await Universal({
      nodes: [{
        name: 'testnet',
        instance: await Node({ url: 'https://testnet.aeternity.io' }),
      }],
      compilerUrl: COMPILER_URL,
    })
    this.contractAccount = await this.signerSdk.getAccount(this.gaPubKey)
    this.contractInstance = await this.signerSdk.getContractInstance(
      {
        source: multisigContract,
        contractAddress: this.contractAccount.contractId,
      },
    )
  },
  methods: {
    async proposeTx () {


      this.spendTx = await aeWallet.sdk.spendTx({
        senderId: this.gaPubKey,
        recipientId: this.recipientKey,
        amount: this.proposedAmount,
      })

      const encoded = encode(unpackTx(this.spendTx).rlpEncoded, 'tx')

      this.spendTxHash = await buildAuthTxHash(encoded)
      const expirationHeight = await this.signerSdk.height() + 50
      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      await gaContractRpc.methods.propose.send(this.spendTxHash, { FixedTTL: [expirationHeight] })

      // todo signer sdk to store
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

      // this.proposedConsensusInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
    },

    async confirmTx () {
      console.log('await aeWallet.sdk', await aeWallet.sdk)
      console.log('this.contractAccount.contractId', this.contractAccount.contractId)
      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      const expirationHeight = await this.signerSdk.height() + 50

      await gaContractRpc.methods.confirm.send(this.txHash, { FixedTTL: [expirationHeight] })

      await updateContractInfo(this.signerSdk, this.gaPubKey) // todo improve/reduce params

      // this.confirmedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
    },

    async sendTx () {
      const nonce = (await this.contractInstance.methods.get_nonce()).decodedResult
      console.log('nonce', nonce)

      const balanceBefore = await this.signerSdk.getBalance(this.recipientKey)
      console.log('balanceBefore', balanceBefore)

      // pre charge GA account create this.gaAccount on chai
      // todo do button workaround in app

      // todo try wrapping it in a PayingForTx?
      //  The issue is the Account the generalized Account is created from (creation is conversion) has to pay for the costs.
      //  Maybe this can be solved using PayingForTx, so someone else pay the fee.
      //  If that approach works we can integrate it into the sdk.

      await aeWallet.sdk.spend(
        776440000000000,
        this.gaPubKey,
      )
      const aaa = {
        publicKey: this.gaPubKey,
        secretKey: this.gaSecret
      }
      const gaAccount = MemoryAccount(
        { keypair: aaa }
      )

      console.log('gaAccount', gaAccount)

      console.log('this.spendTx', this.spendTx)


      const spendTx = await aeWallet.sdk.spendTx({ //this is duplicated so try to separate it
        senderId: this.gaPubKey,
        recipientId: this.recipientKey,
        amount: this.proposedAmount,
      })

      await this.signerSdk.send(
        spendTx,
        {
          onAccount: gaAccount,
          authData: { source: multisigContract, args: [nonce] },
        })

      const balanceAfter = await this.signerSdk.getBalance(this.recipientKey)
      console.log('balanceAfter', balanceAfter)
      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params

      // const consensusInfoAfterSend = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      // console.log('consensusInfo - After Send', consensusInfoAfterSend)
    },

    async revokeTx () {
      const signer1Account = MemoryAccount({ keypair: this.signer1 })
      // todo is account necessary?

      const calldata2 = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'revoke', [this.spendTxHash])
      const contractCallTx2 = await this.signerSdk.contractCallTx({
        callerId: this.signer1Key,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata2,
      })

      const signedContractCallTx2 = await this.signerSdk.signTransaction(
        contractCallTx2,
        {
          onAccount: signer1Account,
          innerTx: true,
        },
      )

      await aeWallet.sdk.payForTransaction(signedContractCallTx2)
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

      // this.revokedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
    },
  },
}
</script>

<style scoped>
.resume {

}
</style>
