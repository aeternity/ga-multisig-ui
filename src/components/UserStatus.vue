<template>
  <div>
    <div v-if="address" class="wallet">
      <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
      <div class="address"> {{ address }}
        <br>
        Chain name
      </div>
    </div>
    <div v-else>
      <button @click="connect">
        Connect
      </button>
    </div>
  </div>
</template>
<script setup>
import { initWallet, wallet } from "../utils/aeternity"
import { toRefs } from "vue"

const { address } = toRefs(wallet)

async function connect () {
  await initWallet()
}
</script>
<style scoped>
.wallet {
  display: flex;
  width: 280px;
}

.address {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
