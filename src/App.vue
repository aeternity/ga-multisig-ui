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
import { onMounted } from 'vue'
import { aeInitWallet } from './utils/aeternity'


onMounted(async () => {
  await aeInitWallet()
  //todo hydrate here?
  // await restoreContractsFromDB()
  // myContracts.value = await getMyContracts()
})

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

