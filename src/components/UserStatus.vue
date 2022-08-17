<template>
  <div>
    <div v-if="address">
      <Wallet :address="address" />
    </div>
    <div v-else>
      <button @click="connect">
        Connect
      </button>
    </div>
  </div>
</template>
<script setup>
import { initWallet, wallet } from "@/utils/aeternity"
import { toRefs } from "vue"
import Wallet from "@/components/Wallet";

const { address } = toRefs(wallet)

async function connect () {
  await initWallet()
}
</script>
