<template>
  <select v-model="contractId"
          @change="selectSafe(contractId)">
    <option v-for="[contractId, {gaAccountId, balance}] in Object.entries(safes)" :value="contractId">
      {{ gaAccountId }} {{ balance ? `(${toAe(balance)} ae)` : "" }}
    </option>
  </select>
</template>
<script setup>
import { toRefs } from "vue"
import { useRouter } from "vue-router"
import { app, clearContractDetail, contractDetail, loadContractDetail } from "@/store"
import { toAe } from "@aeternity/aepp-sdk";

const { contractId } = toRefs(contractDetail)
const { safes } = toRefs(app)

const router = useRouter()

async function selectSafe (contractId) {
  await router.push({ path: `/app/${contractId}` })
  await clearContractDetail()
  await loadContractDetail(contractId)
}
</script>
