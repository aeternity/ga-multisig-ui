<template>
  <div class="container">
    <router-link to="/" class="home-link">
      <h1>
        <img alt="Aeternity" src="./assets/logo.svg" width="80"/>
        Multisig App
      </h1>
    </router-link>
  </div>
  <router-view/>
</template>

<script setup>
import { onMounted, toRefs, watch } from 'vue'
import { aeInitWallet, aeWallet } from './utils/aeternity'
import { hydrateApp } from "./store"
import { useRoute } from "vue-router"

const {
  walletStatus,
  address,
} = toRefs(aeWallet)
const route = useRoute()

onMounted(async () => {
  await aeInitWallet()
})

watch(walletStatus,
  async (newStatus) => {
    if (newStatus === null) {
      // wait for wallet connection because wallet =address is needed to filter My Contracts
      // this should be done in mounted hook
      await hydrateApp()
    }
  },
)
watch(route,
  async (newRoute) => {
    if (newRoute.name === 'index') {
      // rehydrete whn going back to index
      await hydrateApp()
    }
  },
)


</script>

<style>
body {
  display: block;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 30px;
}

h1 {
  color: #de3f6b;
}

li {
  list-style: none;
}

ul {
  padding: 0;
}

small {
  color: gray;
}

.disabled {
  opacity: 0.2;
  filter: blur(1px);
  pointer-events: none;
  transition: 0.5s;
}

.home-link {
  text-decoration: none;
}
</style>

