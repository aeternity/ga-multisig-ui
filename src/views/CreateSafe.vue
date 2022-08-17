<template>
  <h2>Create Safe</h2>
  <create-safe-form v-model="createdContractId" v-if="!isCreating()"/>

  <div v-else>
    <creation-phase-loader/>
    <button @click="getStarted" :disabled="!isCreated()">Get Started</button>
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { wallet } from '@/utils/aeternity'
import { app, clearCreationSteps, contractDetail, hydrateApp, isCreated, isCreating } from "@/store"
import { useRouter } from "vue-router"
import CreationPhaseLoader from "../components/CreationPhaseLoader"
import CreateSafeForm from "../components/CreateSafeForm"

const { address } = toRefs(wallet)
const { contractId } = toRefs(contractDetail)
const { currentSafeContractId } = toRefs(app)

const router = useRouter()

async function getStarted () {
  await hydrateApp()
  await router.push({ path: `/app/${currentSafeContractId.value}` })
  clearCreationSteps()
}
</script>
