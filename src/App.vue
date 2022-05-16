<template>
  <div id="container">

    <router-link to="/">
      <h1><img alt="Aeternity" src="./assets/logo.svg" width="80"/> Multisig App</h1>
    </router-link>
    <WalletInfo class="wallet-info"/>
    <!--todo My Multisig Accounts + Create Button-->

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
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#container {
  padding-top: 30px;
}

.wallet-info {
  width: 320px;
  position: fixed;
  top: 0;
  right: 0;
}
</style>
