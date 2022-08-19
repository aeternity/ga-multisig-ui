<template>
  <div class="detail" v-if="accountId">
    <h2>Safe Detail</h2>
    <signers-list
      :contract-id="contractId"
      :ga-public-key="accountId"
      :version="version"
      :nonce="nonce"/>

    <h2>Transaction</h2>

    <div class="transaction" v-if="accountId">
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
import { app, contractDetail, hydrateApp, loadContractDetail } from '@/store'

import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { wallet } from "@/utils/aeternity"
import TransactionForm from "../components/TransactionForm"
import TransactionStatus from "../components/TransactionStatus"
import LoaderImage from "../components/LoaderImage"

const { isAppHydrated } = toRefs(app)
const { address } = toRefs(wallet)
const {
  accountId,
  contractId,
  version,
  nonce,
} = toRefs(contractDetail)

const route = useRoute()

onMounted(async () => {
  if (!isAppHydrated.value) {
    // when coming directly to transaction detail by url
    await hydrateApp()
  }
  await loadContractDetail(route.params.id || contractId.value)
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

