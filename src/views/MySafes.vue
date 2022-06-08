<template>
  <div class="list">
    <h2>Safes </h2>

    <div v-if="address && !walletStatus && isAppHydrated">
      <div v-for="safe in mySafes">
        <router-link :to="`/detail-safe/${safe.contractId}`">
          {{ safe.contractId }}
          <!--          todo make it better-->

        </router-link>
      </div>
      <div v-if="mySafes?.length === 0">
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
const { mySafes, isAppHydrated } = toRefs(app)

const {
  walletStatus,
  address,
} = toRefs(aeWallet)
</script>
