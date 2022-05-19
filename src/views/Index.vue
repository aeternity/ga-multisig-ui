<template>
  <div class="about">
    <h2>My Contracts
      <router-link to="/create" style="position: relative; bottom: 10px;">
        <button>
          + Create Multisig Contract
        </button>
      </router-link>
    </h2>

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
import { app, hydrateApp } from "../store"
import { aeWallet } from '../utils/aeternity'
import { onMounted, toRefs, watch } from "vue"
import LoaderImage from "../components/LoaderImage"

const { myContracts, isAppHydrated } = toRefs(app)

const {
  walletStatus,
  address,
} = toRefs(aeWallet)

watch(walletStatus,
  async (newStatus) => {
    if (newStatus === null) {
      // todo wait for wallet connection but make hydrate better
      await hydrateApp()
    }
  },
)

// todo merge watch and onmounted

onMounted(async () => {
  // todo move this and hydrate to App
  await hydrateApp()
})

</script>
