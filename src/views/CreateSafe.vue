<template>
  <h2>Create Safe</h2>
  <create-safe-form v-if="!isCreating()"/>

  <div v-else>
    <creation-phase-loader/>
    <button @click="getStarted" :disabled="!isCreated()">Get Started</button>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { aeWallet } from '../utils/aeternity'
import { clearCreationSteps, isCreated, isCreating, loadSafeDetail, safeDetail } from "../store"
import { useRouter } from "vue-router"
import CreationPhaseLoader from "../components/CreationPhaseLoader"
import CreateSafeForm from "../components/CreateSafeForm"

const { address } = toRefs(aeWallet)
const { safeId } = toRefs(safeDetail)

const router = useRouter()

async function getStarted () {
  await loadSafeDetail(safeId.value) //todo is this neccessary?
  await router.push({ path: `/app/${safeId.value}` })
  clearCreationSteps()
}
</script>


<style>
.hidden {
  display: none;
}
</style>
