<template>
  <div class="about">
    <h2>My Contracts
      <router-link to="/create" style="position: relative; bottom: 10px;">
        <button>
          + Create Multisig Contract
        </button>
      </router-link>
    </h2>

    <!--todo fix load in the first time - wait for wallet-->
    <div v-if="address && !walletStatus">
      <div v-for="contract in myContracts">
        <router-link :to="`/detail/${contract.contractId}`">
          {{ contract.contractId }}
        </router-link>
      </div>
      <div v-if="myContracts?.length ===0">
        No contracts created
      </div>
    </div>
    <loader-image v-else/>
  </div>
</template>
<!--todo come up with better hydrating-->
<script setup>
import { app, hydrateApp, loadMyContracts, multisig, restoreContractsFromDB } from "../store"
import { aeWallet } from '../utils/aeternity'
import { computed, onMounted, ref, toRefs, watch } from "vue"
import LoaderImage from "../components/LoaderImage"

const { myContracts } = toRefs(app)
const isLoaded = ref(false)
const walletStatus = computed(() => aeWallet.walletStatus)
const address = computed(() => aeWallet.address)
// todo is this computed neccessary ?


const {
  isAppHydrated,
} = toRefs(multisig)

watch(walletStatus,
  async (newStatus) => {
    if (newStatus === null) {
      // todo wait for wallet connection but make it better
      await hydrateApp()
    }
  },
)

// todo check this page for unused code
// todo merge watch and onmounted

onMounted(async () => {
  // todo move this to App
  await restoreContractsFromDB()
  myContracts.value = await loadMyContracts()
})

</script>

