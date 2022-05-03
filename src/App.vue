<template>
    <div id="container">
        <img alt="Aeternity" src="./assets/logo.svg" style="width: 250px" />
        <h1>Multisig App</h1>
        <div id="nav">
            <router-link to="/">Create</router-link> |
            <router-link to="/about">Load</router-link>
        </div>
    </div>

    <router-view />
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import { aeInitWallet } from './utils/aeternity'

export default defineComponent({
  name: 'App',

  setup () {
    onMounted(async () => {
      await aeInitWallet()
    })
  }
})
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
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
