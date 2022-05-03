<template>
  <div id="container">
    <img alt="Aeternity" src="./assets/logo.svg" style="width: 250px"/>
    <h1>Multisig App</h1>
    <WalletInfo/>
<!--todo My Multisig Accounts + Create Button-->
    <div id="nav">
      <router-link to="/">Create</router-link>
      <router-link to="/load">Load</router-link>
    </div>
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#container {
  padding-top: 30px;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
}

#nav a.router-link-exact-active {
  color: #de3f6b;
}
</style>
