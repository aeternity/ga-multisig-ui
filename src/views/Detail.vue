<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="gaKeyPair && signers">
    <h2>Multisig Detail</h2>
    <!--    todo merge detail and create-->

    <signer-list :contract-id="contractId" :ga-pub-key="gaKeyPair.publicKey" :version="version"/>

    <confirmation-list
      :class="[{'disabled': signers && !confirmedBy}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
      :signers="signers"/>

    <propose-form
      v-if="!hasProposedTx"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>

    <propose-list v-else :proposed-amount="proposedAmount" :recipientAddress="recipientAddress"/>

    <confirm-form
      v-if="!hasConsensus"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
      @confirm-clicked="confirmTx"
      @revoke-clicked="revokeTx"/>
    <send-form
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
    <div v-if="isRevoked">The transaction has been revoked by user ...</div>
    <div v-if="isSent">The transaction has been sent by user...</div>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearState,
  confirmIt,
  contractDetail,
  getContractByContractId,
  getSpendTx,
  hydrateApp,
  patchProposalByContractId,
  patchRevokedStatus,
  patchSentStatus,
  proposeIt,
  revokeIt,
  sendIt,
  updateContractInfo,
} from '../store'

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import ConfirmationList from "../components/ConfirmationList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import LoaderImage from "../components/LoaderImage"
import ProposeList from "./ProposeList"
import SignerList from "./SignerList"
import WalletInfo from "../components/WalletInfo"

const route = useRoute()
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
  gaKeyPair,
  contractId,
  isConfirmedByCurrentUser,
  isRevoked,
  isSent,
  contractAccount,
  contractInstance,
} = toRefs(contractDetail)

const { isAppHydrated } = toRefs(app)

onMounted(async () => {
  // todo maybe onBeforeMount
  clearState()

  if (!isAppHydrated.value) {
    //when going directly to detail page
    await hydrateApp()
  }

  const contractId = route.params.id
  const contractDetails = await getContractByContractId(contractId)

  gaKeyPair.value = {
    publicKey: contractDetails.gaAddress,
    secretKey: contractDetails.gaSecret, //todo rename
  }

  await updateContractInfo()
  // todo can be this done better?
})

async function proposeTx () {
  //todo move this to store or contract action??
  console.log('gaKeyPair.value.publicKey', gaKeyPair.value.publicKey)
  const spendTx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  await proposeIt(spendTx, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await updateContractInfo()
  // todo is ti reaally necceasry?
}

async function confirmTx () {
  await confirmIt(contractId.value, txHash.value)
  await updateContractInfo()
}

async function sendTx () {
  //todo move this to store or contract action??
  const spendTx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)

  await sendIt(contractInstance.value, gaKeyPair.value.publicKey, gaKeyPair.value.secretKey, spendTx)
  //todo is this neccessary to pass?
  await patchSentStatus(contractId.value)
  await updateContractInfo()
}

async function revokeTx () {
  //todo move this to store or contract action??
  const spendTx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  await revokeIt(spendTx, contractId.value)
  await patchRevokedStatus(contractId.value)
  await updateContractInfo()
}
</script>
