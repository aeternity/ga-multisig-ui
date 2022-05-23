<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="gaKeyPair && signers">
    <h2>Multisig Detail</h2>

    <signer-list
      :contract-id="contractId"
      :ga-pub-key="gaKeyPair.publicKey"
      :version="version"/>

    <confirmation-list
      :class="[{'disabled': signers && !confirmedBy}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmations-map="confirmationsMap"/>

    <propose-form
      v-if="!hasProposedTx"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>

    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>

    <confirm-form
      v-if="!hasConsensus"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
      @confirm-clicked="confirm"
      @revoke-clicked="revoke"/>

    <send-form
      v-if="!isRevoked || !isSent"
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      @send-clicked="send"
      @revoke-clicked="revoke"/>
    <div v-if="isRevoked">The transaction has been revoked by user ...</div>
    <div v-if="isSent">The transaction has been sent by user...</div>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearState,
  confirmTx,
  contractDetail,
  getContractByContractId,
  getSpendTx,
  hydrateApp,
  patchProposalByContractId,
  patchRevokedStatus,
  patchSentStatus,
  proposeTx,
  revokeTx,
  sendTx,
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
  spendTx,
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
  confirmationsMap,
} = toRefs(contractDetail)

const { isAppHydrated } = toRefs(app)

onMounted(async () => {
  clearState()

  if (!isAppHydrated.value) {
    // todo improve this. Mounting in app should be enough
    //when going directly to detail page
    await hydrateApp()
  }

  const contractId = route.params.id
  const contractDetails = await getContractByContractId(contractId)

  gaKeyPair.value = contractDetails.gaKeyPair

  await updateContractInfo()
  // todo can be this done better?
})

async function propose () {
  const tx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)

  await proposeTx(tx, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await updateContractInfo()
  // todo is ti reaally necceasry?
}

async function confirm () {
  await confirmTx(contractId.value, txHash.value)
  await updateContractInfo()
}

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, contractInstance.value)
  //todo is this neccessary to pass?
  await patchSentStatus(contractId.value)
  await updateContractInfo()
}

async function revoke () {
  await revokeTx(spendTx.value, contractId.value)
  await patchRevokedStatus(contractId.value)
  await updateContractInfo()
}
</script>
