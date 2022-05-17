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
import { storeContractToDB, updateContractInfo, patchProposalByContractId } from '../store'
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
    requiredSignersAmount: 2,
    gaKeypair: null,
    isGa: null,
    // todo gaAccount wtf
    consensusInfo: null,
    revokedInfo: null,
    signers: null,
    version: null,
    recipientAddress: '',
    proposedConsensusInfo: null,
    confirmedInfo: null,
    proposedAmount: 0,
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

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params

      this.contractAccount = await this.signerSdk.getAccount(this.gaKeypair.publicKey)
      // todo fix je vubec potreba contractaddress ?
      // todo inicializovat zvlast?
      // todo a nestaci ta initial?
      console.log('this.contractAccount', this.contractAccount)
      this.contractInstance = await this.signerSdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )

      this.signers = (await this.contractInstance.methods.get_signers()).decodedResult

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
      await patchProposalByContractId(this.contractAccount.contractId, this.recipientAddress, this.proposedAmount)

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async confirmTx () {
      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      const expirationHeight = await this.signerSdk.height() + 50

      await gaContractRpc.methods.confirm.send(this.spendTxHash, { FixedTTL: [expirationHeight] })

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async sendTx () {
      const nonce = (await this.contractInstance.methods.get_nonce()).decodedResult

      //
      // todo do button workaround  pre charge GA account create this.gaAccount on chai

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

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
    },

    async revokeTx () {
      const encoded = encode(unpackTx(this.spendTx).rlpEncoded, 'tx')

      const spendTxHash = await buildAuthTxHash(encoded)

      const gaContractRpc = await aeWallet.sdk.getContractInstance(
        {
          source: multisigContract,
          contractAddress: this.contractAccount.contractId,
        },
      )
      await gaContractRpc.methods.revoke.send(spendTxHash)


      // todo is account necessary?
      // todo use short version as in Detail

      // const signer1Account = MemoryAccount({ keypair: this.signer1 })

      // const calldata2 = this.contractInstance.calldata.encode('SimpleGAMultiSig', 'revoke', [this.spendTxHash])
      // const contractCallTx2 = await this.signerSdk.contractCallTx({
      //   callerId: this.signer1Key,
      //   contractId: this.contractAccount.contractId,
      //   amount: 0,
      //   gas: 1000000,
      //   gasPrice: 1500000000,
      //   callData: calldata2,
      // })
      //
      // const signedContractCallTx2 = await this.signerSdk.signTransaction(
      //   contractCallTx2,
      //   {
      //     onAccount: signer1Account,
      //     innerTx: true,
      //   },
      // )
      //
      // await aeWallet.sdk.payForTransaction(signedContractCallTx2)

      await updateContractInfo(this.signerSdk, this.gaKeypair.publicKey, this.gaKeypair.secretKey) // todo improve/reduce params
      // todo show link to successful transaction just for show
    },
  },
}
</script>
