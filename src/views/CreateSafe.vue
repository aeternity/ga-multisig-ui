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
import { app, clearCreationSteps, contractDetail, hydrateApp, isCreated, isCreating } from "../store"
import { useRouter } from "vue-router"
import CreationPhaseLoader from "../components/CreationPhaseLoader"
import CreateSafeForm from "../components/CreateSafeForm"

const { address } = toRefs(aeWallet)
const { contractId, createdAccount } = toRefs(contractDetail)
const { mySafes, transactions } = toRefs(app)

const router = useRouter()

async function getStarted () {
  await hydrateApp()

  const createdContractId = transactions.value[transactions.value.length - 1].contractId

  // push created safe to local state because take spme time to update backend entires
  const createdSafe = {
    contractId: createdContractId,
    gaAccountId: createdAccount.value.publicKey,
    signerId: address.value,
  }
  mySafes.value.push(createdSafe)

  await router.push({ path: `/app/${createdContractId}` })


  clearCreationSteps()
}
</script>
