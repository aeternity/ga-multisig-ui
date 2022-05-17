<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="isCurrentUserSigner">
    <h2>Contract Detail</h2>
    <!--    todo merge detail and create-->
    <propose-form
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>
    <confirm-form
      v-if="hasProposedTx"
      :signers="signers"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
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
  <!--  todo add loader-->
</template>

<script>
import { aeWallet, buildAuthTxHash } from '../utils/aeternity'
import {
  confirmIt,
  getContractByContractId,
  multisig,
  patchProposalByContractId, proposeIt,
  revokeIt,
  sendIt,
  updateContractInfo,
} from '../store'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { MemoryAccount, Node, Universal } from '@aeternity/aepp-sdk'

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { COMPILER_URL } from "../utils/aeternity/configs"
import WalletInfo from "../components/WalletInfo"

export default {
  name: 'Detail',
  components: { WalletInfo, SendForm, ConfirmForm, ProposeForm },
  data: () => ({
    signerSdk: null,
    contractAccount: null,
    contractInstance: null,
    spendTx: null,
    proposedAmount: null,
    recipientAddress: null,
    hasProposedTx: null,
    hasConsensus: null,
    gaPubKey: null,
    gaSecret: null,
    txHash: null,
    signers: null,
    confirmations: null,
    confirmedBy: null,
    confirmationsRequired: null,
  }),
  computed: {

    isCurrentUserSigner () {
      // todo how to remove boilerplate. Vue3 store + options
      return multisig.isCurrentUserSigner
    },

  },
  watch: {
    $route (newValue, oldValue) {
      if (oldValue.id === this.$route.params.id) {
        this.clearValues()
        // todo fix clearing
      }
    },
  },
  async mounted () {
    const contractId = this.$route.params.id
    const contractDetails = await getContractByContractId(contractId)
    await this.loadContract(contractDetails.gaAddress, contractDetails.gaSecret)     // todo  can be this done better?


    this.bindValues()
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
    bindValues() {
      this.recipientAddress = multisig.recipientAddress
      this.proposedAmount = multisig.proposedAmount
      this.hasProposedTx = multisig.hasProposedTx
      this.hasConsensus = multisig.hasConsensus
      this.gaPubKey = multisig.gaPubKey
      this.gaSecret = multisig.gaSecret
      this.txHash = multisig.txHash
      this.signers = multisig.signers
      this.confirmedBy = multisig.confirmedBy
      this.confirmations = multisig.confirmations
      this.confirmationsRequired = multisig.confirmationsRequired
    },
    clearValues() {
      // todo move thi to store
      this.recipientAddress =null
      this.proposedAmount = null
      this.hasProposedTx = null
      this.hasConsensus = null
      this.gaPubKey = null
      this.gaSecret = null
      this.txHash = null
      this.signers = null
      this.confirmedBy = null
      this.confirmations = null
      this.confirmationsRequired = null
    },
    async loadContract (gaAddress, gaSecret) {
      const signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
      })
      await updateContractInfo(signerSdk, gaAddress, gaSecret)
    },
    async proposeTx () {
      this.spendTx = await aeWallet.sdk.spendTx({
        senderId: this.gaPubKey,
        recipientId: this.recipientAddress, //todo not connected
        amount: this.proposedAmount, //todo not connected
      })

      await proposeIt(this.spendTx, this.signerSdk, this.contractAccount.contractId)

      // todo signer sdk to store
      await patchProposalByContractId(this.contractAccount.contractId, this.recipientAddress, this.proposedAmount)
      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },

    async confirmTx () {
      await confirmIt(this.contractAccount.contractId, this.signerSdk, this.txHash)
      await updateContractInfo(this.signerSdk, this.gaPubKey) // todo improve/reduce params
    },

    async sendTx () {
      const gaAccount = MemoryAccount(
        {
          keypair: {
            publicKey: this.gaPubKey,
            secretKey: this.gaSecret,
          },
        },
      )

      const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
        senderId: this.gaPubKey,
        recipientId: this.recipientAddress,
        amount: this.proposedAmount,
      })

      await sendIt(this.contractInstance, this.gaPubKey, gaAccount, spendTx, this.signerSdk)

      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },

    async revokeTx () {
      const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
        senderId: this.gaPubKey,
        recipientId: this.recipientAddress,
        amount: this.proposedAmount,
      })
      // todo is account necessary?

      await revokeIt(spendTx, this.contractAccount.contractId, this.signerSdk, this.gaPubKey, this.gaSecret)

      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },
  },
}
</script>
