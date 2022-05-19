<template>
  <!--  todo hydrate on create? -> -->
  <!--  todo this will happen when directly going to create "find", multisigContracts.value is-->
  <WalletInfo class="wallet-info"/>
  <div class="create">
    <h2>Create Multisig Account</h2>

    <signer-list
      v-if="signers && confirmedBy"
      :contract-id="contractId"
      :ga-pub-key="gaPubKey"
      :version="version"/>

    <signers-form
      v-if="!signers && !confirmedBy"
      v-model:signer-1-key="signer1Key"
      v-model:signer2-key="signer2Key"
      v-model:required-signers-amount="requiredSignersAmount"
      @create-clicked="crateGaAccount"/>

    <confirmation-list
      v-else
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
      :signers="signers"/>

    <propose-form
      v-if="!hasProposedTx"
      :class="[{'disabled': !signers && !confirmedBy}]"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>

    <propose-list v-else :proposed-amount="proposedAmount" :recipientAddress="recipientAddress"/>

    <send-form
      :class="[{'disabled': !hasProposedTx}]"
      :has-consensus="hasConsensus"
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
    <!--    todo add charge button-->
    <div v-if="isRevoked">The transaction has been revoked by user ...</div>
    <div v-if="isSent">The transaction has been sent by user...</div>
  </div>
</template>

<script setup>
import { Crypto } from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmationList from "../components/ConfirmationList"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'

import { aeWallet } from '../utils/aeternity' // todo import ->const
import {
  clearState,
  confirmIt,
  contractDetail,
  getUniversalStamp,
  initMultisigContract,
  patchProposalByContractId,
  patchRevokedStatus,
  patchSentStatus,
  proposeIt,
  revokeIt,
  sendIt,
  storeContractToDB,
  updateContractInfo,
} from '../store'
import { onMounted, ref, toRefs } from "vue"
import SendForm from "../components/SendForm"
import ProposeList from "./ProposeList"
import SignerList from "./SignerList"
import WalletInfo from "../components/WalletInfo"

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
  gaSecret,
  recipientAddress,
  confirmedBy,
  isConfirmedByCurrentUser,
  contractId,
  isRevoked,
  isSent,
  contractAccount,
  contractInstance,
} = toRefs(contractDetail)

const signer1Key = ref('')
const signer2Key = ref('')
const requiredSignersAmount = ref(0)

const gaKeypair = ref(null) // todo take this from store?
const spendTx = ref(null)
const spendTxHash = ref(null)

onMounted(() => clearState())

async function crateGaAccount () {
  gaKeypair.value = Crypto.generateKeyPair() //todo try to replace pubkey and secret with keypair
  gaPubKey.value = gaKeypair.value.publicKey // todo is this needed to push to store before? can it be reactive?
  gaSecret.value = gaKeypair.value.secretKey
//todo how to push this into state - because its not accissible with .value (torefs?)
  // todo try universal as this in data
  const signerSdk = await getUniversalStamp()

  const contractInstanceInitial = await signerSdk.getContractInstance(
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

  await initMultisigContract(contractArgs, contractInstanceInitial, gaKeypair.value)
  await updateContractInfo() //todo order
  await storeContractToDB(contractId.value, gaKeypair.value.publicKey, gaKeypair.value.secretKey, signers.value)
}

async function proposeTx () {
  spendTx.value = await aeWallet.sdk.spendTx({
    senderId: gaKeypair.value.publicKey,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })

  await proposeIt(spendTx.value, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await updateContractInfo()// todo is this neccessary? can be doe rectively?
}

async function confirmTx () {
  await confirmIt(contractId.value, spendTxHash.value) // todo contractAccount is neccessary to pass?
  await updateContractInfo()
}

async function sendTx () {
  // todo gaaccount is not ref
  await sendIt(contractInstance.value, gaKeypair.value.publicKey, gaAccount.value, spendTx.value)
  await patchSentStatus(contractId.value)
  await updateContractInfo()
}

async function revokeTx () {
  await revokeIt(spendTx.value, contractId.value)
  // todo is this updating neccessary?
  await patchRevokedStatus(contractId.value)
  await updateContractInfo()
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
