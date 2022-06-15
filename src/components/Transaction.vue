<template>
  <div class="transaction" v-if="gaKeyPair && signers">
    <!--todo rename this component to two words-->

    <div class="transaction-detail">
      <!--      todo rename these components-->
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

    <div class="transaction-status">
      <strong>Status</strong>
      <transaction-status/>
    </div>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearTransactionDetail,
  getSafeByAddress,
  getSpendTx,
  getTransactionByDBIndex,
  hydrateApp,
  loadTransactionDetail,
  proposeTx,
  safeDetail,
  storeTransactionToDB,
  transactionDetail,
  updateProposeTx,
} from '../store'

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import LoaderImage from "../components/LoaderImage"
import ProposeList from "../components/ProposeList"

import { aeWallet } from "../utils/aeternity"
import TransactionStatus from "./TransactionStatus"

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
  spendTx,
  txHash,
  version,
  nonce,
} = toRefs(transactionDetail)

const { safeId, safeKeyPair } = toRefs(safeDetail)
const { address } = toRefs(aeWallet)
const { isAppHydrated } = toRefs(app)
const route = useRoute()

onMounted(async () => {
  clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await initTransaction()
  // todo move conditions here
})

async function initTransaction () {
  gaKeyPair.value = safeKeyPair.value

  // todo check if needed. Feed with props?
  const safe = getSafeByAddress(gaKeyPair.value.publicKey)
  const transaction = getTransactionByDBIndex(safe.currentTransactionId)

  const hasAttachedTransaction = safe.currentTransactionId !== undefined
  const isTransactionTerminated = !!transaction?.sentBy || !!transaction?.revokedBy
  if (!hasAttachedTransaction || isTransactionTerminated) {
    await storeTransactionToDB(safeId.value)
  }
  await loadTransactionDetail()
}

async function resetTransaction () {
  await clearTransactionDetail()
  await initTransaction()
}

async function propose () {
  const txToPropose = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  await proposeTx(txToPropose, safeId.value)
  await updateProposeTx(safeId.value, recipientAddress.value, proposedAmount.value)
  await loadTransactionDetail()
}
</script>

<style scoped>
.transaction {
  display: flex;
}

.transaction-detail {
  width: 500px;
  margin-right: 15px;
}

.transaction-status {
  width: 200px;
}
</style>
