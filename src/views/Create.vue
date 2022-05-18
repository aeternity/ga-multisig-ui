<template>
  <WalletInfo class="wallet-info"/>
  <div class="create">
    <h2>Create Multisig Account</h2>
    <!--    todo fix casing-->
    <signers-form
      v-model:signer1Key="signer1Key"
      v-model:signer2Key="signer2Key"
      v-model:requiredSignersAmount="requiredSignersAmount"
      @create-clicked="crateGaAccount"/>

    <propose-form
      :class="[{'disabled': !signers}]"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>

    <confirmation-list
      :class="[{'disabled': !signers}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
      :signers="signers"/>

    <!--    todo show only confirmation block -->
    <!--    <confirm-form-->
    <!--      :class="[{'disabled': !hasProposedTx}]"-->
    <!--      @confirm-clicked="confirmTx"-->
    <!--      @revoke-clicked="revokeTx"/>-->
    <!--    todo confirmationsRequired is not defined-->

    <!--    todo this will not be needed for creation-->
    <!--    <send-form-->
    <!--      :class="[{'disabled': !hasConsensus}]"-->
    <!--      @send-clicked="sendTx"-->
    <!--      @revoke-clicked="revokeTx"/>-->
    <!--    todo add charge button-->
  </div>
</template>

<script setup>
import { Crypto, MemoryAccount, Node, Universal } from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmationList from "../components/ConfirmationList"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'

import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { aeWallet } from '../utils/aeternity' // todo import ->const
import {
  clearState,
  confirmIt,
  multisig,
  patchProposalByContractId,
  proposeIt,
  revokeIt,
  sendIt,
  storeContractToDB,
  updateContractInfo,
} from '../store'
import { COMPILER_URL } from '../utils/aeternity/configs'
import WalletInfo from "../components/WalletInfo"
import { onMounted, ref, toRefs } from "vue"

const {
  version,
  confirmations,
  confirmationsRequired,
  signers,
  hasConsensus,
  hasProposedTx,
  isCurrentUserSigner,
  txHash,
  proposedAmount,
  gaPubKey,
  recipientAddress,
  confirmedBy,
} = toRefs(multisig)


const gaAccount = ref(null)
const signer1Key = ref('')
const signer2Key = ref('')
const requiredSignersAmount = ref(0)
const gaKeypair = ref(null)

const spendTx = ref(null)
const spendTxHash = ref(null)
const contractAccount = ref(null)
const contractInstance = ref(null)
const signerSdk = ref(null) //todo or move to stor;

const contractInstanceInitial = ref(null)

onMounted(async () => {
  clearState()
})


async function crateGaAccount () {
  gaKeypair.value = Crypto.generateKeyPair()
  const gaAccount = MemoryAccount({ keypair: gaKeypair.value }) //todo how to push this into state - because its not accissible with .value (torefs?)
  // todo try universal as this in data

  signerSdk.value = await Universal({
    nodes: [{
      name: 'testnet',
      instance: await Node({ url: 'https://testnet.aeternity.io' }),
    }],
    compilerUrl: COMPILER_URL,
  })
  const contractInstanceInitial = await signerSdk.value.getContractInstance(
    { source: multisigContract })

  await contractInstanceInitial.compile()

  signers.value = [
    signer1Key.value,
    signer2Key.value,
  ]
  const contractArgs = [
    requiredSignersAmount.value,
    signers.value,
  ]

  const attachTX = await signerSdk.value.gaAttachTx({
    ownerId: gaKeypair.value.publicKey,
    code: contractInstanceInitial.bytecode,
    callData: contractInstanceInitial.calldata.encode(contractInstanceInitial._name, 'init', contractArgs),
    authFun: hash('authorize'),
    gas: await contractInstanceInitial._estimateGas('init', contractArgs),
    options: {
      innerTx: true,
    },
  })
// todo break into functions

  const { rawTx } = await signerSdk.value.send(attachTX.tx, {
    innerTx: true,
    onAccount: gaAccount,
  })

  await aeWallet.sdk.payForTransaction(rawTx)

  await updateContractInfo(
    signerSdk.value,
    gaKeypair.value.publicKey,
    gaKeypair.value.secretKey,
  ) // todo improve/reduce params

  contractAccount.value = await signerSdk.value.getAccount(gaKeypair.value.publicKey)
  // todo fix je vubec potreba contractaddress ?
  // todo inicializovat zvlast?
  // todo a nestaci ta initial?
  contractInstance.value = await signerSdk.value.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.value.contractId,
    })

  await storeContractToDB(contractAccount.value.contractId, gaKeypair.value.publicKey, gaKeypair.value.secretKey, signers.value)
}


async function proposeTx () {
  spendTx.value = await aeWallet.sdk.spendTx({
    senderId: gaKeypair.value.publicKey,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  await proposeIt(spendTx.value, signerSdk.value, contractAccount.value.contractId)
  // todo signer sdk to store
  await patchProposalByContractId(contractAccount.value.contractId, recipientAddress.value, proposedAmount.value)
  await updateContractInfo(signerSdk.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey) // todo improve/reduce params
}

async function confirmTx () {
  await confirmIt(contractAccount.value.contractId, signerSdk.value, spendTxHash.value)
  await updateContractInfo(signerSdk.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey) // todo improve/reduce params
}

async function sendTx () {
  // todo gaaccount is not ref
  await sendIt(contractInstance.value, gaKeypair.value.publicKey, gaAccount.value, spendTx.value, signerSdk.value)
  await updateContractInfo(signerSdk.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey) // todo improve/reduce params
}

async function revokeTx () {
  await revokeIt(spendTx.value, contractAccount.value.contractId, signerSdk.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey)
  await updateContractInfo(signerSdk.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey) // todo improve/reduce params
}

//   computed: {
// // todo conditions as computed properties
//     isProposeBlockHidden () {
//       // todo this is probably not needed
//       return isCurrentUserSigner && signers
//     },
//   },
// }
</script>
