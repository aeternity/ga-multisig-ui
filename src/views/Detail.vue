<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="gaPubKey">
    <h2>Multisig Detail</h2>
    <!--    todo merge detail and create-->

    <signer-list :contract-id="contractId" :ga-pub-key="gaPubKey" :version="version"/>

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
import { aeWallet } from '../utils/aeternity'
import {
  clearState,
  confirmIt,
  contractDetail,
  getContractByContractId,
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

import { onMounted, ref, toRefs } from "vue"
import { useRoute } from "vue-router"
import LoaderImage from "../components/LoaderImage"
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
  recipientAddress,
  confirmedBy,
  gaSecret,
  contractId,
  isConfirmedByCurrentUser,
  isAppHydrated,
  isRevoked,
  isSent,
  contractAccount,
  contractInstance,
} = toRefs(contractDetail)

const signerSdk = ref(null)
const spendTx = ref(null)

// todo comment watcher
// todo maybe onBeforeMount
const route = useRoute()

onMounted(async () => {
  clearState()

  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  const contractId = route.params.id
  const contractDetails = await getContractByContractId(contractId)
  gaPubKey.value = contractDetails.gaAddress // todo needed for loadContract -> updatecontractInfo but its kinda hasty
  gaSecret.value = contractDetails.gaSecret //tod is this set in store?

  await updateContractInfo()
  // todo can be this done better?
})

async function proposeTx () {
  // todo reuse this function
  spendTx.value = await aeWallet.sdk.spendTx({
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value, //todo not connected
    amount: proposedAmount.value, //todo not connected
  })

  await proposeIt(spendTx.value, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await updateContractInfo()
  // todo is ti reaally necceasry?
}

async function confirmTx () {
  await confirmIt(contractId.value, txHash.value)
  await updateContractInfo()
}

async function sendTx () {
  const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  await sendIt(contractInstance.value, gaPubKey.value, gaSecret.value, spendTx)
  //todo is this neccessary to pass?
  await patchSentStatus(contractId.value)
  await updateContractInfo()
}


async function revokeTx () {
  // todo detect revoked status
  const spendTx = await aeWallet.sdk.spendTx({
    //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })

  await revokeIt(spendTx, contractId.value)
  await patchRevokedStatus(contractId.value)
  await updateContractInfo()
}
</script>
