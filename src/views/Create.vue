<template>
  <div class="home">
    <h1>Create Multisig Account</h1>
    <br>
    <br>
    <br>
    <!--    <button @click="handleClick">createGAFlow</button>-->
    <!--    Result: {{ result }}-->
    <signers-form
      v-if="signer1 && signer2"
      :signer1="signer1"
      :signer2="signer2"
      @amount-updated="handleAmountUpdated"
      @create-clicked="handleCreateClicked"/>
    <propose-form
      :recipient="recipient"
      :proposed-amount="proposedAmount"
      @propose-clicked="handleProposeClicked"/>
    <confirm-form
      @confirm-clicked="handleConfirmClicked"
      @revoke-clicked="handleRevokeClicked"/>
    <send-form
      @send-clicked="handleSendClicked"
      @revoke-clicked="handleRevokeClicked"/>
    <!--    todo add charge button-->
    <br>

  </div>
</template>

<script>
import {
  Crypto,
  MemoryAccount,
  Node,
  Universal,
  TxBuilderHelper
} from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import CreateAccountForm from "../components/CreateAccountForm"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { Buffer } from "buffer"
import { aeWallet } from '../utils/aeternity'

// todo store vs page sweetspot
export default {
  name: 'Home',
  components: { CreateAccountForm, SendForm, ConfirmForm, ProposeForm, SignersForm },
  data: () => ({
    // todo pass models
    // todo remove word
    payerSdk: null,
    connectedAddress: null,
    signer1: Crypto.generateKeyPair(),
    signer2: Crypto.generateKeyPair(),
    signersAmount: 2,
    gaKeypair: null,
    isGa: null,
    consensusInfo: null,
    revokedInfo: null,
    signers: null,
    version: null,
    recipient: Crypto.generateKeyPair(),
    proposedConsensusInfo: null,
    confirmedInfo: null,
    proposedAmount: 1000,
    spendTx: null,
    spendTxHash: null,
    contractAccount: null,
    contractInstance: null,
    inputAddress: null,
    loadedContractInfo: null,
  }),
  computed: {
// todo conditions as computed properties
  },

  methods: {
    // todo rename 'handle'  functions
    async handleAmountUpdated (amount) {
      this.signersAmount = amount
    },

    async handleCreateClicked () {
      console.log('clicked')
      this.gaKeypair = Crypto.generateKeyPair()

      const gaAccount = MemoryAccount({ keypair: this.gaKeypair })
      console.log('aa')
      // todo try universal as this in data
      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
        accounts: [gaAccount],
      })
      console.log('ccc')
      const contractInstanceInitial = await signerSdk.getContractInstance(
        { source: multisigContract })

      await contractInstanceInitial.compile()

      const multisigArgs = [
        this.signersAmount,
        [
          this.signer1.publicKey,
          this.signer2.publicKey
        ],
      ]

      const attachTX = await signerSdk.gaAttachTx({
        ownerId: this.gaKeypair.publicKey,
        code: contractInstanceInitial.bytecode,
        callData: contractInstanceInitial.calldata.encode(contractInstanceInitial._name, 'init', multisigArgs),
        authFun: hash('authorize'),
        gas: await contractInstanceInitial._estimateGas('init', multisigArgs),
        options: {
          innerTx: true,
        },
      })

      const { rawTx } = await signerSdk.send(attachTX.tx, {
        innerTx: true,
        onAccount: gaAccount,
      })

      await aeWallet.sdk.payForTransaction(rawTx)

      this.isGa = await signerSdk.isGA(this.gaKeypair.publicKey)

      this.contractAccount = await signerSdk.getAccount(this.gaKeypair.publicKey)

      this.contractInstance = await signerSdk.getContractInstance(
        { source: multisigContract, contractAddress: this.contractAccount.contractId },
      )

      this.consensusInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult

      this.signers = (await this.contractInstance.methods.get_signers()).decodedResult
      this.version = (await this.contractInstance.methods.get_version()).decodedResult
      console.log('signers', this.signers)
    },

    async handleProposeClicked () {
      const gaAccount = MemoryAccount({ keypair: this.gaKeypair })

      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
        accounts: [gaAccount],
      })

      this.spendTx = await aeWallet.sdk.spendTx({
        senderId: this.gaKeypair.publicKey,
        recipientId: this.recipient.publicKey,
        amount: this.proposedAmount,
      })

      const encoded = encode(unpackTx(this.spendTx).rlpEncoded, 'tx')

      this.spendTxHash = this.buildAuthTxHash(encoded)
      console.log('spendTxHash', this.spendTxHash)
      const expirationHeight = await signerSdk.height() + 50

      const calldata = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'propose', [this.spendTxHash, { FixedTTL: [expirationHeight] }])
      const contractCallTx = await signerSdk.contractCallTx({
        callerId: this.signer1.publicKey,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata,
      })

      const signedContractCallTx = await signerSdk.signTransaction(
        contractCallTx, { onAccount: this.signer1, innerTx: true },
      )

      await aeWallet.sdk.payForTransaction(
        signedContractCallTx,
      )

      this.proposedConsensusInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      console.log('this.proposedConsensusInfo', this.proposedConsensusInfo)

    },

    async handleConfirmClicked () {
      const gaAccount = MemoryAccount({ keypair: this.gaKeypair })

      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
        accounts: [gaAccount],
      })


      const calldata2 = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'confirm', [this.spendTxHash])
      const contractCallTx2 = await signerSdk.contractCallTx({
        callerId: this.signer2.publicKey,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata2,
      })

      const signedContractCallTx2 = await signerSdk.signTransaction(
        contractCallTx2, { onAccount: this.signer2, innerTx: true },
      )

      await aeWallet.sdk.payForTransaction(signedContractCallTx2)

      this.confirmedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      console.log('consensusInfo - After Confirm', this.confirmedInfo)
    },

    async handleSendClicked () {
      // todo gaaccount to data
      const gaAccount = MemoryAccount({ keypair: this.gaKeypair })

      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
        accounts: [gaAccount],
      })

      const nonce = (await this.contractInstance.methods.get_nonce()).decodedResult

      const balanceBefore = await signerSdk.getBalance(this.recipient.publicKey)

      console.log('recipient balanceBefore', balanceBefore)

      // pre charge GA account create gaAccount on chai
      // todo do button workaround in app
      await aeWallet.sdk.spend(
        776440000000000,
        this.gaKeypair.publicKey,
      )

      await signerSdk.send(
        this.spendTx,
        {
          onAccount: gaAccount,
          authData: { source: multisigContract, args: [nonce] },
        })

      const balanceAfter = await signerSdk.getBalance(this.recipient.publicKey)
      console.log('recipient balance After', balanceAfter)

      const consensusInfoAfterSend = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      console.log('consensusInfo - After Send', consensusInfoAfterSend)
    },

    async handleRevokeClicked () {
      const gaAccount = MemoryAccount({ keypair: this.gaKeypair })

      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
        accounts: [gaAccount],
      })

      const signer1Account = MemoryAccount({ keypair: this.signer1 })

      const calldata2 = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'revoke', [this.spendTxHash])
      const contractCallTx2 = await signerSdk.contractCallTx({
        callerId: this.signer1.publicKey,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata2,
      })

      const signedContractCallTx2 = await signerSdk.signTransaction(
        contractCallTx2, { onAccount: signer1Account, innerTx: true },
      )

      await aeWallet.sdk.payForTransaction(signedContractCallTx2)

      this.revokedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
    },

    async loadContractInfo () {

      const signerSdk = await Universal({
        nodes: [{
          name: 'net',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: 'https://compiler.aepps.com',
      })

      const contractAccount = await signerSdk.getAccount(this.inputAddress.trim())

      const contractInstance = await signerSdk.getContractInstance(
        { source: multisigContract, contractAddress: contractAccount.contractId },
      )

      this.loadedContractInfo = (await contractInstance.methods.get_consensus_info()).decodedResult
    },

    buildAuthTxHash (rlpTransaction) {
      // todo move to utils
      //  eslint-disable-next-line
      return new Uint8Array(Crypto.hash(Buffer.concat([
          Buffer.from(aeWallet.sdk.getNetworkId()),
          TxBuilderHelper.decode(rlpTransaction, 'tx'),
        ])),
      )
    },
  },
}
</script>
