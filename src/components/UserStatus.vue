<template>
  <div>
    <div v-if="address" class="wallet">
      <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
      <div class="address"> {{ address }}
        <br>
        Chain name
        <!--          todo chain name-->
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
import { aeInitWallet, aeWallet } from "../utils/aeternity"
import { toRefs } from "vue"

const { address } = toRefs(aeWallet)

async function connect () {
  await aeInitWallet()
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
