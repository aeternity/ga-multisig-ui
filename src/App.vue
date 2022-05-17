<template>
  <div class="container">
    <router-link to="/">
      <h1>
        <img alt="Aeternity" src="./assets/logo.svg" width="80"/>
        Multisig App
      </h1>
    </router-link>
  </div>
  <router-view/>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { aeInitWallet } from './utils/aeternity'
import WalletInfo from "./components/WalletInfo"

export default defineComponent({
  name: 'App',
  components: { WalletInfo },
  setup () {
    onMounted(async () => {
      await aeInitWallet()
    })
  },
})
</script>

<style scoped>
a {
  text-decoration: none;
}

h1 {
  color: #de3f6b;
}

body {
  display: block;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  padding-top: 30px;
}
</style>
