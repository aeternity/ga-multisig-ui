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
import { wallet } from "@/utils/aeternity"
import { onMounted, toRefs } from "vue"
import { app, contractDetail } from "@/store"
import { useRoute, useRouter } from "vue-router"

const { address } = toRefs(wallet)
const { contractId } = toRefs(contractDetail)
const { safes } = toRefs(app)

const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const hasAnySafes = Object.keys(safes.value).length > 0

  if (hasAnySafes) {
    const lastSafeId = Object.keys(safes.value)[Object.keys(safes.value).length - 1]
    const selectedContractId = route.params.id || lastSafeId
    await router.push({ path: `/app/${selectedContractId}` })
  } else {
    await router.push({ path: '/app' })
  }
});
</script>

