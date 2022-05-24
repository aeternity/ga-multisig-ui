<template>
  <div class="detail" v-if="gaKeyPair && signers">
    <h2>Multisig Detail</h2>

    <signer-list
      :contract-id="contractId"
      :ga-public-key="gaKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <confirmation-list
      :class="[{'disabled': signers && !confirmedBy}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmations-map="confirmationsMap"/>

    <propose-form
      v-if="!hasProposedTx  && !(revokedBy || sentBy)"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>

    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>

    <confirm-form
      v-if="!hasConsensus && !(revokedBy || sentBy)"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
      @confirm-clicked="confirm"
      @revoke-clicked="revoke"/>

    <send-form
      v-if="!(revokedBy || sentBy)"
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      :is-multisig-account-charged="isMultisigAccountCharged"
      @send-clicked="send"
      @revoke-clicked="revoke"
      @charge-clicked="chargeAccount"/>
    <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
    <h5 v-if="sentBy">
      The transaction has been sent by user <i>{{ sentBy }}</i> to account
      <a :href="`https://explorer.testnet.aeternity.io/account/${recipientAddress}`"
         target="_blank">
        {{ recipientAddress }}
      </a>
    </h5>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearContractDetail,
  confirmTx,
  contractDetail,
  getContractByContractId,
  getSpendTx,
  hydrateApp,
  loadContractDetail,
  patchProposalByContractId,
  patchRevokedStatus,
  patchSentStatus,
  preChargeMultisigAccount,
  proposeTx,
  revokeTx,
  sendTx,
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


const route = useRoute()
const {
  gaKeyPair,
  isMultisigAccountCharged,
  contractId,
  contractAccount,
  contractInstance,
  hasProposedTx,
  hasConsensus,
  revokedBy,
  sentBy,
  isConfirmedByCurrentUser,
  isCurrentUserSigner,
  signers,
  proposedAmount,
  recipientAddress,
  confirmations,
  confirmationsRequired,
  confirmationsMap,
  confirmedBy,
  spendTx,
  txHash,
  version,
  nonce,
} = toRefs(contractDetail)

const { isAppHydrated } = toRefs(app)

onMounted(async () => {
  clearContractDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await initContractDetail()
})

async function initContractDetail () {
  const contractId = route.params.id
  const contractDetail = await getContractByContractId(contractId)
  gaKeyPair.value = contractDetail.gaKeyPair

  await loadContractDetail()
}

async function propose () {
  const tx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  // todo fix pre tx

  await proposeTx(tx, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await loadContractDetail()
}

async function confirm () {
  await confirmTx(contractId.value, txHash.value)
  await loadContractDetail()
}

async function chargeAccount () {
  // workaround to pre charge multisig account in order to have enough funds to make sendTx
  await preChargeMultisigAccount(gaKeyPair.value.publicKey)
  await loadContractDetail()
}

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, contractInstance.value)
  await patchSentStatus(contractId.value, gaKeyPair.value.publicKey)
  await loadContractDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, contractId.value)
  await patchRevokedStatus(contractId.value, revokedBy)
  await loadContractDetail()
}
</script>
