<template>
  <div class="transaction-detail">
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
      :is-confirm-hidden="isConfirmedByCurrentUser"
      :class="[{'disabled': !hasProposedTx}]"
    />
    <send-form
      v-if="!(revokedBy || sentBy)"
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
    <div v-if="revokedBy || sentBy">
      <button @click="resetTransaction">New Transaction</button>
    </div>
  </div>
</template>
<script setup>
import ProposeForm from "./ProposeForm"
import ProposeList from "./ProposeList"
import ConfirmForm from "./ConfirmForm"
import SendForm from "./SendForm"
import { onMounted, toRefs } from "vue"
import {
  app,
  clearContractDetail,
  clearTransactionData,
  contractDetail,
  getSpendTx,
  hydrateApp,
  loadContractDetail,
  proposeTx,
  updateProposeTx,
} from "../store"

const {
  account,
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
  spendTx,
  txHash,
  version,
  nonce,
} = toRefs(contractDetail)

const { isAppHydrated } = toRefs(app)

async function resetTransaction () {
  await clearTransactionData(contractId.value)
  await clearContractDetail()
  await initTransaction()
}

async function initTransaction () {

  const hasAttachedTransaction = !!proposedAmount.value //todo better condition
  console.log('ZZZ hasAttachedTransaction', hasAttachedTransaction)
  const isTransactionTerminated = !!sentBy.value || !!revokedBy.value
  console.log('ZZZ isTransactionTerminated', isTransactionTerminated)
  console.log('ZZZ condition', !hasAttachedTransaction || isTransactionTerminated)
  // todo ressurect this with better conditions
  // if (!hasAttachedTransaction || isTransactionTerminated) {
  //   await storeTransactionToDB(contractId.value, account.value)
  // }
  await loadContractDetail(contractId.value)
}

async function propose () {
  const txToPropose = await getSpendTx(account.value.publicKey, recipientAddress.value, proposedAmount.value)
  console.log('txToPropose', txToPropose)
  await proposeTx(txToPropose, contractId.value)
  await updateProposeTx(contractId.value, recipientAddress.value, proposedAmount.value)
  await loadContractDetail(contractId.value)
}

onMounted(async () => {

  // clearContractDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }


  await initTransaction()
})

// todo move conditions here


</script>

<style scoped>
.transaction-detail {
  width: 500px;
  margin-right: 15px;
}
</style>
