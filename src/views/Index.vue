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
       <router-link :to="`/detail/${contract.gaKeyPair.publicKey}`">
         {{ contract.gaKeyPair.publicKey }}
       </router-link>
     </div>
     <div v-if="myContracts?.length ===0">
       No contracts assigned to you, but you can create one
     </div>
   </div>
    <loader-image v-else/>
  </div>
</template>
<!--todo come up with better hydrating-->

<script setup>
import { app } from "../store"
import { aeWallet } from '../utils/aeternity'
import { toRefs } from "vue"
import LoaderImage from "../components/LoaderImage"

const { myContracts, isAppHydrated } = toRefs(app)

const {
  walletStatus,
  address,
} = toRefs(aeWallet)

// todo rehydrate when going to index
</script>
