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
  // wait for wallet connection because wallet =address is needed to filter My Contracts
  // this should be done in mounted hook
  // await hydrateApp()
  // console.log('contractId.value', contractId.value)
  const lastestCreatedSafeId = mySafes.value[mySafes.value.length - 1].contractId
  const selectedcontractId = route.params.id || lastestCreatedSafeId
  // todo fix here

  if (mySafes.value.length > 0) {
    console.log('loadContractDetail from Index')

    // await loadContractDetail(selectedcontractId)
    await router.push({ path: `/app/${selectedcontractId}` })
  } else {
    await router.push({ path: '/app' })
  }
})
</script>


<style scoped>
.create-safe {

}
</style>
