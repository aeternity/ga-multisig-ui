<template>
  <div class="about">
    <h2>Transactions </h2>

    <div v-if="address && !walletStatus">
      <div v-for="contract in myWallets">
        <router-link :to="`/detail/${contract.contractId}`">
          {{ contract.contractId }}
        </router-link>
      </div>
      <div v-if="myWallets?.length === 0">
        No contracts assigned to you, but you can create one
      </div>
    </div>
    <loader-image v-else/>
  </div>
</template>

<script setup>
import { app } from "../store"
import { aeWallet } from '../utils/aeternity'
import { toRefs } from "vue"
import LoaderImage from "../components/LoaderImage"
import { useRoute } from "vue-router"

const route = useRoute()
const { myWallets, isAppHydrated } = toRefs(app)

const {
  walletStatus,
  address,
} = toRefs(aeWallet)
</script>
