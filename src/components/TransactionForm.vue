<template>
  <div class="transaction-detail">
    <propose-form
      v-if="isProposeFormDisplayed"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>
    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>
    <confirm-form
      v-if="isConfirmFormDisplayed"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
    />
    <send-form
      v-if="isSendFormDisplayed"
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      :is-multisig-account-charged="isMultisigAccountCharged"
    />
    <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
    <h5 v-if="sentBy">
      The transaction has been sent by user <i>{{ sentBy }}</i> to account
      <a :href="`https://explorer.testnet.aeternity.io/account/${recipientAddress}`"
         target="_blank">
        {{ recipientAddress }}
      </a>
    </h5>
    <div v-if="isRestartTransactionDisplayed">
      <button @click="resetTransaction">New Transaction</button>
    </div>
  </div>
</template>
<script setup>
import ProposeForm from "./ProposeForm"
import ProposeList from "./ProposeList"
import ConfirmForm from "./ConfirmForm"
import SendForm from "./SendForm"
import { computed, toRefs } from "vue"
import {
  clearContractDetail,
  clearTransactionData,
  contractDetail,
  getSpendTx,
  loadContractDetail,
  proposeTx,
  updateProposeTx,
} from "../store"

const {
  accountId,
  isMultisigAccountCharged,
  contractId,
  hasProposedTx,
  hasConsensus,
  revokedBy,
  sentBy,
  isConfirmedByCurrentUser,
  proposedAmount,
  recipientAddress,
} = toRefs(contractDetail)

const isProposeFormDisplayed = computed(() => !hasProposedTx.value && !(revokedBy.value || sentBy.value))
const isConfirmFormDisplayed = computed(() => !hasConsensus.value && !(revokedBy.value || sentBy.value))
const isSendFormDisplayed = computed(() => !(revokedBy.value || sentBy.value))
const isRestartTransactionDisplayed = computed(() => revokedBy.value || sentBy.value)

async function resetTransaction () {
  await clearTransactionData(contractId.value)
  await clearContractDetail()
  await loadContractDetail(contractId.value)
}

async function propose () {
  const txToPropose = await getSpendTx(accountId.value, recipientAddress.value, proposedAmount.value)
  await proposeTx(txToPropose, contractId.value)
  await updateProposeTx(contractId.value, recipientAddress.value, proposedAmount.value)
  await loadContractDetail(contractId.value)
}

</script>

<style scoped>
.transaction-detail {
  width: 500px;
  margin-right: 15px;
}
</style>
