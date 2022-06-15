<template>
  <select :value="safeId">
    <option
      v-for="safe in mySafes"
      @click="selectSafe(safe.contractId)"
      :value="safe.contractId">
      {{ safe.contractId }}
    </option>
  </select>
</template>
<script setup>
import { toRefs } from "vue"
import { useRouter } from "vue-router"
import { app, clearTransactionDetail, loadTransactionDetail, safeDetail, transactionDetail } from "../store"

const { safeKeyPair, safeId } = toRefs(safeDetail)
const { gaKeyPair } = toRefs(transactionDetail)
const { mySafes } = toRefs(app)

const router = useRouter()

async function selectSafe (safeId) {
  // todo unite functions
  await router.push({ path: `/app/${safeId}` })
  await clearTransactionDetail()

  // todo check if needed. Feed with props?
  gaKeyPair.value = safeKeyPair.value
  await loadTransactionDetail()
}
</script>
