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
.home-link {
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
  padding: 30px;
}

li {
  list-style: none;
}

ul {
  padding: 0;
}

.disabled {
  opacity: 0.2;
  filter: blur(1px);
  pointer-events: none;
  transition: 0.5s;
}

small {
  color: gray;
}

</style>
