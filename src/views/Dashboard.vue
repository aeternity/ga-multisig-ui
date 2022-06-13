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

    <br>



    <!--  <loader-image v-else/>-->
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

const {
  address,
} = toRefs(aeWallet)

const route = useRoute()
const {
  safeKeyPair,
  safeId,
  version,
  nonce,
} = toRefs(safeDetail)
const {
  gaKeyPair,

} = toRefs(transactionDetail)

const { isAppHydrated } = toRefs(app)

onMounted(async () => {
  // clearTransactionDetail()

  //when going directly to detail page from pasted url
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
