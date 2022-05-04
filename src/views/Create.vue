<template>
  <div class="create">
    <h1>Create Multisig Account</h1>
    is current user signer? {{ isCurrentUserSigner }}
    <br>
    <br>
    <br>
    <signers-form
      v-model:signer1Key="signer1Key"
      v-model:signer2Key="signer2Key"
      v-model:requiredSignersAmount="requiredSignersAmount"
      @create-clicked="crateGaAccount"/>
    <propose-form
      v-if="!isProposeBlockHidden"
      :recipient-key="recipient.publicKey"
      :proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>
    <confirm-form
      @confirm-clicked="confirmTx"
      @revoke-clicked="revokeTx"/>
    <send-form
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
    <!--    todo add charge button-->
  </div>
</template>

<script>
import {
  Crypto,
  MemoryAccount,
  Node,
  Universal,
} from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
// todo load from github
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { aeWallet, buildAuthTxHash } from '../utils/aeternity'
import { updateContractInfo } from '../store'
import { COMPILER_URL } from '../utils/aeternity/configs'


// todo store vs page sweetspot
export default {
  name: 'Home',
  components: { SendForm, ConfirmForm, ProposeForm, SignersForm },
  data: () => ({
    // todo pass models
    payerSdk: null,
    connectedAddress: null,
    signer1Key: '',
    signer2Key: '',
    requiredSignersAmount: 2,
    gaKeypair: null,
    isGa: null,
    // todo gaAccount wtf
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
    signerSdk: null, //todo or move to store
  }),
  computed: {
// todo conditions as computed properties
    isCurrentUserSigner () {
      console.log('aeWallet.address', aeWallet.address)
      return this.signers ? this.signers.includes(aeWallet.address) : false
    },
    isProposeBlockHidden () {
      return this.isCurrentUserSigner && this.signers
    },
  },

  methods: {
    // todo rename 'handle'  functions
    async handleAmountUpdated (amount) {
      this.requiredSignersAmount = amount
    },

    async crateGaAccount () {
      this.gaKeypair = Crypto.generateKeyPair()

      this.gaAccount = MemoryAccount({ keypair: this.gaKeypair })
      // todo try universal as this in data
      this.signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
        accounts: [this.gaAccount],
      })
      const contractInstanceInitial = await this.signerSdk.getContractInstance(
        { source: multisigContract })

      await contractInstanceInitial.compile()

      const multisigArgs = [
        this.requiredSignersAmount,
        [
          this.signer1Key,
          this.signer2Key,
        ],
      ]

      const attachTX = await this.signerSdk.gaAttachTx({
        ownerId: this.gaKeypair.publicKey,
        code: contractInstanceInitial.bytecode,
        callData: contractInstanceInitial.calldata.encode(contractInstanceInitial._name, 'init', multisigArgs),
        authFun: hash('authorize'),
        gas: await contractInstanceInitial._estimateGas('init', multisigArgs),
        options: {
          innerTx: true,
        },
      })

      const { rawTx } = await this.signerSdk.send(attachTX.tx, {
        innerTx: true,
        onAccount: this.gaAccount,
      })

      await aeWallet.sdk.payForTransaction(rawTx)

      this.isGa = await this.signerSdk.isGA(this.gaKeypair.publicKey)


      updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

      this.contractAccount = await this.signerSdk.getAccount(this.gaKeypair.publicKey)
      // todo fix je vubec potreba contractaddress ?
      // todo inicializovat zvlast?
      // todo a nestaci ta initial?

      this.contractInstance = await this.signerSdk.getContractInstance(
        { source: multisigContract, contractAddress: this.contractAccount.contractId },
      )
      //
      // this.consensusInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      //
      // this.signers = (await this.contractInstance.methods.get_signers()).decodedResult
      // this.version = (await this.contractInstance.methods.get_version()).decodedResult
      console.log('signers', this.signers)
      // todo save to localstorage
    },

    async proposeTx () {

      this.spendTx = await aeWallet.sdk.spendTx({
        senderId: this.gaKeypair.publicKey,
        recipientId: this.recipient.publicKey,
        amount: this.proposedAmount,
      })
      console.log('propose')


      const encoded = encode(unpackTx(this.spendTx).rlpEncoded, 'tx')

      this.spendTxHash = await buildAuthTxHash(encoded)
      console.log('this.spendTxHash', this.spendTxHash)
      const expirationHeight = await this.signerSdk.height() + 50
      console.log('propose1')
      const calldata = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'propose', [this.spendTxHash, { FixedTTL: [expirationHeight] }])
      console.log('propose2')
      const contractCallTx = await this.signerSdk.contractCallTx({
        callerId: this.signer1Key,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata,
      })
      console.log('propose3')

      const signedContractCallTx = await this.signerSdk.signTransaction(
        contractCallTx, { onAccount: this.signer1, innerTx: true },
        // todo sign from wallet
      )


      await aeWallet.sdk.payForTransaction(
        signedContractCallTx,
      )

      // todo signer sdk to store
      updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params


      // this.proposedConsensusInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      console.log('this.proposedConsensusInfo', this.proposedConsensusInfo)
    },

    async confirmTx () {
      const calldata2 = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'confirm', [this.spendTxHash])
      const contractCallTx2 = await this.signerSdk.contractCallTx({
        callerId: this.signer2Key,
        contractId: this.contractAccount.contractId,
        amount: 0,
        gas: 1000000,
        gasPrice: 1500000000,
        callData: calldata2,
      })

      const signedContractCallTx2 = await this.signerSdk.signTransaction(
        contractCallTx2, { onAccount: this.signer2, innerTx: true },
        //todo sign from wallet
      )

      await aeWallet.sdk.payForTransaction(signedContractCallTx2)
      console.log('uuu')
      updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

      // this.confirmedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
      console.log('consensusInfo - After Confirm', this.confirmedInfo)
    },

    async sendTx () {
      const nonce = (await this.contractInstance.methods.get_nonce()).decodedResult

      const balanceBefore = await this.signerSdk.getBalance(this.recipient.publicKey)

      console.log('recipient balanceBefore', balanceBefore)

      // pre charge GA account create this.gaAccount on chai
      // todo do button workaround in app

      // todo try wrapping it in a PayingForTx?
      //  The issue is the Account the generalized Account is created from (creation is conversion) has to pay for the costs.
      //  Maybe this can be solved using PayingForTx, so someone else pay the fee.
      //  If that approach works we can integrate it into the sdk.

      await aeWallet.sdk.spend(
        776440000000000,
        this.gaKeypair.publicKey,
      )

      await this.signerSdk.send(
        this.spendTx,
        {
          onAccount: this.gaAccount,
          authData: { source: multisigContract, args: [nonce] },
        })

      const balanceAfter = await this.signerSdk.getBalance(this.recipient.publicKey)
      console.log('recipient balance After', balanceAfter)

      updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

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
      updateContractInfo(this.signerSdk, this.gaKeypair.publicKey) // todo improve/reduce params

      // this.revokedInfo = (await this.contractInstance.methods.get_consensus_info()).decodedResult
    },

    async loadContractInfo () {
      const contractAccount = await this.signerSdk.getAccount(this.inputAddress.trim())

      const contractInstance = await this.signerSdk.getContractInstance({
        source: multisigContract,
        contractAddress: contractAccount.contractId,
      })
      // todo reuse contractInstance and contract account

      this.loadedContractInfo = (await contractInstance.methods.get_consensus_info()).decodedResult
    },
  },
}
</script>
