<template>
  <select v-model="contractId"
          @change="selectSafe(contractId)">
    <option v-for="[contractId, {balance}] in Object.entries(safes)" :value="contractId">
     {{ contractId }}  {{balance ? `(${balance} ae)` : ""}}
    </option>
  </select>
</template>
<script setup>
import { toRefs } from "vue"
import { useRouter } from "vue-router"
import { app, clearContractDetail, contractDetail, loadContractDetail } from "@/store"

const { contractId } = toRefs(contractDetail)
const { safes } = toRefs(app)

const router = useRouter()

async function selectSafe (contractId) {
  await router.push({ path: `/app/${contractId}` })
  await clearContractDetail()
  await loadContractDetail(contractId)
}
</script>
