<template>

  <WalletInfo class="wallet-info"/>
  <div class="create">
    <h2>Create Multisig Account</h2>
    <br>
    <br>
    <!--    todo fix casing-->
    <signers-form
      v-model:signer1Key="signer1Key"
      v-model:signer2Key="signer2Key"
      v-model:requiredSignersAmount="requiredSignersAmount"
      @create-clicked="crateGaAccount"/>
    <propose-form
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>
    <confirm-form
      :signers="signers"
      :confirmed-by="confirmedBy"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
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

import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { aeWallet, buildAuthTxHash } from '../utils/aeternity'
import {
  storeContractToDB,
  updateContractInfo,
  patchProposalByContractId,
  revokeIt,
  sendIt,
  confirmIt,
  proposeIt, multisig,
} from '../store'
import { COMPILER_URL } from '../utils/aeternity/configs'
import WalletInfo from "../components/WalletInfo"


// todo store vs page sweetspot
export default {
  name: 'Home',
  components: { WalletInfo, SendForm, ConfirmForm, ProposeForm, SignersForm },
  data: () => ({
    // todo pass models
    payerSdk: null,
    connectedAddress: null,
    signer1Key: '',
    signer2Key: '',
    requiredSignersAmount: 0,
    gaKeypair: null,
    // todo gaAccount wtf
    consensusInfo: null,
    revokedInfo: null,
    signers: null,
    proposedAmount: multisig.proposedAmount,
    recipientAddress: multisig.recipientAddress,
    spendTx: null,
    spendTxHash: null,
    contractAccount: null,
    contractInstance: null,
    contractInstanceInitial: null,
    signerSdk: null, //todo or move to store
    confirmedBy: null,
    confirmations: null,
  }),
  computed: {
// todo conditions as computed properties
    isProposeBlockHidden () {
      // todo this is probably not needed
      return this.isCurrentUserSigner && this.signers
    },
  },

  methods: {
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
      })
      const contractInstanceInitial = await this.signerSdk.getContractInstance(
        { source: multisigContract })

      await contractInstanceInitial.compile()

      this.signers = [
        this.signer1Key,
        this.signer2Key,
      ]

      const multisigArgs = [
        this.requiredSignersAmount,
        this.signers,
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

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params

      this.contractAccount = await this.signerSdk.getAccount(this.gaKeypair.publicKey)
      // todo fix je vubec potreba contractaddress ?
      // todo inicializovat zvlast?
      // todo a nestaci ta initial?
      this.contractInstance = await this.signerSdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        })

      await storeContractToDB(
        this.contractAccount.contractId,
        this.gaKeypair.publicKey,
        this.gaKeypair.secretKey,
        this.signers,
      )
    },

    async proposeTx () {
      this.spendTx = await aeWallet.sdk.spendTx({
        senderId: this.gaKeypair.publicKey,
        recipientId: this.recipientAddress,
        amount: this.proposedAmount,
      })
      await proposeIt(this.spendTx, this.signerSdk, this.contractAccount.contractId)
      // todo signer sdk to store
      await patchProposalByContractId(this.contractAccount.contractId, this.recipientAddress, this.proposedAmount)
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async confirmTx () {
      await confirmIt(this.contractAccount.contractId, this.signerSdk, this.spendTxHash)
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async sendTx () {
      await sendIt(this.contractInstance, this.gaKeypair.publicKey, this.gaAccount, this.spendTx, this.signerSdk)
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async revokeTx () {
      await revokeIt(this.spendTx, this.contractAccount.contractId, this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey)
      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },
  },
}
</script>
