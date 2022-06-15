<template>
  <div class="create-safe">
    <h2>Welcome to Multisig</h2>
    <p>
      Create a new Safe that is controlled by one or multiple owners.

      You will be required to pay a network fee for creating your new Safe.

      Gnosis Safe is the most trusted platform to manage digital assets.
      Here is how to get started:</p>
    <router-link to="/app/open">
      <button>
        New Safe
      </button>
    </router-link>
  </div>
</template>

<script setup>
import { aeWallet } from "../utils/aeternity"
import { onMounted, toRefs } from "vue"
import { app, contractDetail } from "../store"
import { useRoute, useRouter } from "vue-router"

const { walletStatus, address } = toRefs(aeWallet)
const { contractId } = toRefs(contractDetail)
const { mySafes } = toRefs(app)

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const hasAnySafes = mySafes.value.length > 0

  if (hasAnySafes) {
    const lastSafeId = mySafes.value[mySafes.value.length - 1].contractId
    const selectedContractId = route.params.id || lastSafeId

    await router.push({ path: `/app/${selectedContractId}` })
  } else {
    await router.push({ path: '/app' })
  }
})
</script>

