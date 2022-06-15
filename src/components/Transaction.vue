<!--<template>-->
<!--  <div class="transaction" v-if="gaKeyPair && signers">-->
<!--    &lt;!&ndash;todo rename this component to two words&ndash;&gt;-->

<!--    <transaction-form/>-->

<!--    <div class="transaction-status">-->
<!--      <strong>Status</strong>-->
<!--      <transaction-status/>-->
<!--    </div>-->
<!--  </div>-->
<!--  <loader-image v-else/>-->
<!--</template>-->

<!--<script setup>-->
<!--import {-->
<!--  app,-->
<!--  clearTransactionDetail,-->
<!--  getSafeByAddress,-->
<!--  getSpendTx,-->
<!--  getTransactionByDBIndex,-->
<!--  hydrateApp,-->
<!--  loadTransactionDetail,-->
<!--  proposeTx,-->
<!--  safeDetail,-->
<!--  storeTransactionToDB,-->
<!--  transactionDetail,-->
<!--  updateProposeTx,-->
<!--} from '../store'-->

<!--import { onMounted, toRefs } from "vue"-->
<!--import { useRoute } from "vue-router"-->
<!--import LoaderImage from "../components/LoaderImage"-->

<!--import { aeWallet } from "../utils/aeternity"-->
<!--import TransactionStatus from "./TransactionStatus"-->
<!--import TransactionForm from "./TransactionForm"-->

<!--const {-->
<!--  gaKeyPair,-->
<!--  isMultisigAccountCharged,-->
<!--  contractId,-->
<!--  contractAccount,-->
<!--  contractInstance,-->
<!--  hasProposedTx,-->
<!--  hasConsensus,-->
<!--  revokedBy,-->
<!--  sentBy,-->
<!--  isConfirmedByCurrentUser,-->
<!--  isCurrentUserSigner,-->
<!--  signers,-->
<!--  proposedAmount,-->
<!--  recipientAddress,-->
<!--  confirmations,-->
<!--  confirmationsRequired,-->
<!--  spendTx,-->
<!--  txHash,-->
<!--  version,-->
<!--  nonce,-->
<!--} = toRefs(transactionDetail)-->

<!--const { safeId, safeKeyPair } = toRefs(safeDetail)-->
<!--const { address } = toRefs(aeWallet)-->
<!--const { isAppHydrated } = toRefs(app)-->
<!--const route = useRoute()-->

<!--onMounted(async () => {-->
<!--  clearTransactionDetail()-->

<!--  //when going directly to detail page from pasted url-->
<!--  if (!isAppHydrated.value) {-->
<!--    await hydrateApp()-->
<!--  }-->

<!--  await initTransaction()-->
<!--  // todo move conditions here-->
<!--})-->

<!--async function initTransaction () {-->
<!--  gaKeyPair.value = safeKeyPair.value-->

<!--  // todo check if needed. Feed with props?-->
<!--  const safe = getSafeByAddress(gaKeyPair.value.publicKey)-->
<!--  const transaction = getTransactionByDBIndex(safe.currentTransactionId)-->

<!--  const hasAttachedTransaction = safe.currentTransactionId !== undefined-->
<!--  const isTransactionTerminated = !!transaction?.sentBy || !!transaction?.revokedBy-->
<!--  if (!hasAttachedTransaction || isTransactionTerminated) {-->
<!--    await storeTransactionToDB(safeId.value)-->
<!--  }-->
<!--  await loadTransactionDetail()-->
<!--}-->

<!--async function resetTransaction () {-->
<!--  await clearTransactionDetail()-->
<!--  await initTransaction()-->
<!--}-->

<!--async function propose () {-->
<!--  const txToPropose = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)-->
<!--  await proposeTx(txToPropose, safeId.value)-->
<!--  await updateProposeTx(safeId.value, recipientAddress.value, proposedAmount.value)-->
<!--  await loadTransactionDetail()-->
<!--}-->
<!--</script>-->

<!--<style scoped>-->
<!--.transaction {-->
<!--  display: flex;-->
<!--}-->

<!--.transaction-status {-->
<!--  width: 200px;-->
<!--}-->
<!--</style>-->
