<template>
  <div class="detail" v-if="safeKeyPair">
    <h2>Safe Detail</h2>
    <signers-list
      :contract-id="safeId"
      :ga-public-key="safeKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <h2>Transaction</h2>
    <!--    <div class="transaction" v-if="gaKeyPair && signers">-->
    <div class="transaction" v-if="gaKeyPair">
      <transaction-form/>

      <div class="transaction-status">
        <strong>Status</strong>
        <transaction-status/>
      </div>
    </div>
    <loader-image v-else/>
  </div>
</template>

<script setup>
import { app, hydrateApp, loadSafeDetail, safeDetail, transactionDetail } from '../store'

import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"
import TransactionForm from "../components/TransactionForm"
import TransactionStatus from "../components/TransactionStatus"
import LoaderImage from "../components/LoaderImage"

const { isAppHydrated } = toRefs(app)
const { address } = toRefs(aeWallet)
const { gaKeyPair, signers } = toRefs(transactionDetail)

const route = useRoute()

const {
  safeKeyPair,
  safeId,
  version,
  nonce,
} = toRefs(safeDetail)

onMounted(async () => {
  console.log('mounted Dashboard')
  if (!isAppHydrated.value) {
    await hydrateApp()
  }
  console.log('route.params.id', route.params.id)
  console.log('safeId.value', safeId.value)
  await loadSafeDetail(route.params.id || safeId.value)
  // await clearTransactionDetail()

  // todo check if needed. Feed with props?
  gaKeyPair.value = safeKeyPair.value
  // await loadTransactionDetail()
})


</script>

<style scoped>
.transaction {
  display: flex;
}

.transaction-status {
  width: 200px;
}
</style>

