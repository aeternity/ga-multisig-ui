<template>
  <select :value="contractId">
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
import { app, clearContractDetail, contractDetail, loadContractDetail } from "../store"

const { contractId } = toRefs(contractDetail)
const { mySafes } = toRefs(app)

const router = useRouter()

async function selectSafe (contractId) {
  await router.push({ path: `/app/${contractId}` })
  await clearContractDetail()

  // todo check if needed.
  console.log('loadContractDetail from SafeSelect')
  await loadContractDetail(contractId)
}
</script>
