<template>
  <header>
    <router-link to="/" class="home-link">
      <img alt="Aeternity" src="../assets/logo.svg" width="60"/>
      <h1> Multisig Safe</h1>
    </router-link>
    <div class="network">
      Network: {{ walletNetwork }}
    </div>
    <user-status/>
  </header>
</template>

<script setup>
import UserStatus from "./UserStatus"
import { wallet } from '@/utils/aeternity'
import { computed } from "vue";

const walletNetwork = computed(() => wallet.networkId)
</script>
<style scoped>

h1 {
  color: #de3f6b;
  font-size: 24px;
  margin-left: 20px;
}

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgba(40, 54, 61, 0.18) 0px 2px 4px 0px;
  padding: 0 12px;
}

.home-link {
  display: flex;
  text-decoration: none;
}

.network {
  font-size: 0.8rem;
  border-radius: 4px;
  padding: 4px 8px;
  background-color: #de3f6b;
  color: #fff;
}
</style>
