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
      <div>
        <div v-if="address" class="wallet">
          <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
          <div class="address"> {{ address }}
            <br>
            Chain name
            <!--          todo chain name-->
          </div>
        </div>
        <div v-else>

          <button @click="connect">
            Connect
          </button>
        </div>

      </div>
    </header>

    <aside v-if="route.name !== 'landing'">
      <div class="sidebar" v-if="safeKeyPair">
        My safes
        <select :value="safeId">
          <!--          todo v-model-->
          <option
            v-for="safe in mySafes"
            @click="selectSafe(safe.contractId)"
            :value="safe.contractId">
            {{ safe.contractId }}
          </option>
        </select>
        <br>
        <router-link to="/create-safe">
          <button>
            New Safe
          </button>
        </router-link>
        <hr>
        <ul>
          <li class="user">

            <img :src="`https://avatars.z52da5wt.xyz/${safeKeyPair.publicKey}`" alt="" width="100">
            <div class="address"> {{ safeKeyPair.publicKey || 'not connected' }}</div>
            <!--          todo disconnect-->
          </li>

          <li>
            Balance
            <br>
            {{ balance }}
            <br>
            <router-link to="/top-up">
              top up
            </router-link>
            <hr>
          </li>
          <li>
            <router-link :to="`/dashboard/${safeId}`">
              <button>
                Home
              </button>
            </router-link>
          </li>
          <li>
            <a target="_blank" :href="`https://explorer.testnet.aeternity.io/account/${safeKeyPair.publicKey}`">
              <button>
                History
              </button>
            </a>
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
import { toRefs, watch } from 'vue'
import { aeInitWallet, aeWallet } from './utils/aeternity'
import {
  app,
  clearTransactionDetail,
  hydrateApp,
  loadSafeDetail,
  loadTransactionDetail,
  safeDetail,
  transactionDetail,
} from "./store"
import { useRoute, useRouter } from "vue-router"

const { walletStatus, address } = toRefs(aeWallet)
const { safeKeyPair, balance, safeId } = toRefs(safeDetail)
const { gaKeyPair } = toRefs(transactionDetail)
const { mySafes } = toRefs(app)

const route = useRoute()
const router = useRouter()

async function connect () {
  await aeInitWallet()
}

async function selectSafe (safeId) {
  // todo unite functions
  await router.push({ path: `/dashboard/${safeId}` })
  await clearTransactionDetail()

  // todo check if needed. Feed with props?
  gaKeyPair.value = safeKeyPair.value
  await loadTransactionDetail()
}

watch(walletStatus,
  async (newStatus) => {
    if (newStatus === null) {
      // wait for wallet connection because wallet =address is needed to filter My Contracts
      // this should be done in mounted hook
      await hydrateApp()
      await loadSafeDetail(safeId.value || mySafes.value[0].contractId)
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
  padding: 0 12px;
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

