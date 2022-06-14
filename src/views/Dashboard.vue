<template>
  <div class="detail" v-if="safeKeyPair">
    <h2>Safe Detail</h2>
    <signers-list
      :contract-id="safeId"
      :ga-public-key="safeKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <h2>Transaction</h2>
    <transaction/>
  </div>
</template>

<script setup>
import {
  app,
  clearTransactionDetail,
  hydrateApp,
  loadSafeDetail,
  loadTransactionDetail,
  safeDetail,
  transactionDetail,
} from '../store'

import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"
import Transaction from "../components/Transaction"

const { isAppHydrated } = toRefs(app)
const { address } = toRefs(aeWallet)
const { gaKeyPair } = toRefs(transactionDetail)

const route = useRoute()

const {
  safeKeyPair,
  safeId,
  version,
  nonce,
} = toRefs(safeDetail)

onMounted(async () => {
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await loadSafeDetail(route.params.id || safeId.value)
  await clearTransactionDetail()

  // todo check if needed. Feed with props?
  gaKeyPair.value = safeKeyPair.value
  await loadTransactionDetail()
})
</script>
