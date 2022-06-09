<template>
  <div class="container">
    <!--    todo componentize-->
    <!--todo mobile firest-->
    <header>
      <!--      todo layout-->
      <router-link to="/landing" class="home-link">
        <img alt="Aeternity" src="./assets/logo.svg" width="60"/>
        <h1> Multisig Safe</h1>
      </router-link>
      <div class="wallet">
        <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
        <div class="address"> {{ address || 'not connected' }}
          <!--          todo if not connected-->
          <br>
          Chain name
          <!--          todo connect manually-->
        </div>

      </div>
    </header>

    <aside v-if="route.name !== 'landing'">
      <div class="sidebar" v-if="gaKeyPair">
        Selected safe
        <select>
          <option @click="loadSafeDetail(safe.contractId)" v-for="safe in mySafes" :value="safe.gaKeyPair.publicKey">
            {{ safe.gaKeyPair.publicKey }}
          </option>
        </select>
        <ul>
          <li class="user">

            <img :src="`https://avatars.z52da5wt.xyz/${gaKeyPair.publicKey}`" alt="" width="100">
            <div class="address"> {{ gaKeyPair.publicKey || 'not connected' }}</div>
            <!--          todo disconnect-->
          </li>
          <li>
            <router-link to="/create-transaction">
              <button>
                New Transaction
              </button>
            </router-link>
          </li>
          <li>
            Balance
            <br>
            {{ balance }}
            <br>
            <router-link to="/topup">
              top up
            </router-link>
          </li>

        </ul>
      </div>

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
import { app, hydrateApp, loadSafeDetail, safeDetail } from "./store"
import { useRoute } from "vue-router"

const {
  walletStatus,
  address,
} = toRefs(aeWallet)

const { mySafes } = toRefs(app)


const { gaKeyPair, balance } = toRefs(safeDetail)
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
      console.log('mySafes', mySafes.value)
      await loadSafeDetail(mySafes.value[0].contractId)
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
  box-shadow: rgba(40, 54, 61, 0.18) 0px 2px 4px 0px;
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

.user {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar {
  padding: 8px;
}

h1 {
  color: #de3f6b;
  font-size: 24px;
  margin-left: 20px;
}

</style>


<style>

body {
//grid-template-columns: 1fr min(100rem, 100%) 1fr; display: block !important; font-family: Avenir, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; padding: 0;
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
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

