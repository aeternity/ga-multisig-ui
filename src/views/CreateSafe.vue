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
import { aeWallet } from '@/utils/aeternity'
import { app, clearCreationSteps, contractDetail, hydrateApp, isCreated, isCreating } from "@/store"
import { useRouter } from "vue-router"
import CreationPhaseLoader from "../components/CreationPhaseLoader"
import CreateSafeForm from "../components/CreateSafeForm"

const { address } = toRefs(aeWallet)
const { contractId } = toRefs(contractDetail)
const { safes } = toRefs(app)

const router = useRouter()

async function getStarted () {
  await hydrateApp()

  const createdContractId = safes.value[safes.value.length - 1].contractId
  await router.push({ path: `/app/${createdContractId}` })


  clearCreationSteps()
}
</script>
