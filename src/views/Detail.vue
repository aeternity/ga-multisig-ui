<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="isCurrentUserSigner">
    <h2>Contract Detail</h2>
    <!--    todo merge detail and create-->
    <propose-form
      :recipient-address="recipientAddress"
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
  <!--  todo add loader-->
</template>

<script>
import { aeWallet, buildAuthTxHash } from '../utils/aeternity'
import { getContractByContractId, multisig, patchProposalByContractId, updateContractInfo } from '../store'
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
  }),
  computed: {
    currentUserAddress () {
      return aeWallet.address
    },
    isCurrentUserSigner () {
      // todo how to remove boilerplate. Vue3 store + options
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
    recipientAddress () {
      return multisig.recipientKey
    },
    proposedAmount () {
      return multisig.proposedAmount
    },
  },
  async mounted () {
    const contractId = this.$route.params.id
    const contractDetails = await getContractByContractId(contractId)
    console.log('contractDetails', contractDetails)
    await this.loadContract(contractDetails.gaAddress, contractDetails.gaSecret)     // todo  can be this done better?

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
      await patchProposalByContractId(this.contractAccount.contractId, this.recipient, this.proposedAmount)
      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },

    async confirmTx () {
      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      const expirationHeight = await this.signerSdk.height() + 50

      await gaContractRpc.methods.confirm.send(this.txHash, { FixedTTL: [expirationHeight] })

      await updateContractInfo(this.signerSdk, this.gaPubKey) // todo improve/reduce params
    },

    async sendTx () {
      const nonce = (await this.contractInstance.methods.get_nonce()).decodedResult

      const balanceBefore = await this.signerSdk.getBalance(this.recipientAddress)

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
        secretKey: this.gaSecret,
      }
      const gaAccount = MemoryAccount(
        { keypair: aaa },
      )

      const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
        senderId: this.gaPubKey,
        recipientId: this.recipientAddress,
        amount: this.proposedAmount,
      })

      await this.signerSdk.send(
        spendTx,
        {
          onAccount: gaAccount,
          authData: { source: multisigContract, args: [nonce] },
        })

      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },

    async revokeTx () {
      // todo is account necessary?

      const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
        senderId: this.gaPubKey,
        recipientId: this.recipientAddress,
        amount: this.proposedAmount,
      })

      const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')

      const spendTxHash = await buildAuthTxHash(encoded)

      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      await gaContractRpc.methods.revoke.send(spendTxHash)

      await updateContractInfo(this.signerSdk, this.gaPubKey, this.gaSecret) // todo improve/reduce params
    },
  },
}
</script>
