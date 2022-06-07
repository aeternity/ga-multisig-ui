<template>
  <div class="container">

    <header>
      <router-link to="/welcome" class="home-link">
        <img alt="Aeternity" src="./assets/logo.svg" width="80"/>
        <h1> Multisig Wallet</h1>
      </router-link>
      <div class="wallet">
        <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
        <div class="address"> {{ address || 'not connected' }}
          <br>
          Chain name
        </div>

      </div>
    </header>

    <aside>
      <ul>
        <li>
          <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="100">
          <div class="address"> {{ address || 'not connected' }}</div>
        </li>
        <li>
          <router-link to="/create">
            <button>
              New Transaction
            </button>
          </router-link>
        </li>
        <li>
          <router-link to="/list" class="home-link">
            Transactions
          </router-link>
        </li>
      </ul>
    </aside>

    <main>
      <article>
        <router-view/>
      </article>
    </main>

  </div>
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

<style scoped>

.container {
  display: grid;
  grid-template-areas:
    "header header"
    "aside main";
  grid-template-rows: 55px calc(100vh - 55px);
  grid-template-columns: 200px auto;
}

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

aside {
  grid-area: aside;
  padding: 0;
  margin-left: 0;
  width: 100%;
  border: 0;
}

main {
  grid-area: main;
  overflow: auto;
  padding-top: 0;
}

article {
  border: 0;

}

.wallet {
  display: flex;
  width: 280px;
}


</style>


<style>

body {
//grid-template-columns: 1fr min(100rem, 100%) 1fr; display: block !important; font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
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
  display: flex;
  text-decoration: none;
}

.address {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

