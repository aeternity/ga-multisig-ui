<template>
  <div class="sidebar" v-if="safeKeyPair">
    My safes
    <select :value="safeId">
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
</template>
<script setup>
import { toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { app, clearTransactionDetail, loadTransactionDetail, safeDetail, transactionDetail } from "../store"
import { useRoute, useRouter } from "vue-router"


const { walletStatus, address } = toRefs(aeWallet)
const { safeKeyPair, balance, safeId } = toRefs(safeDetail)
const { gaKeyPair } = toRefs(transactionDetail)
const { mySafes } = toRefs(app)

const route = useRoute()
const router = useRouter()

async function selectSafe (safeId) {
  // todo unite functions
  await router.push({ path: `/dashboard/${safeId}` })
  await clearTransactionDetail()

  // todo check if needed. Feed with props?
  gaKeyPair.value = safeKeyPair.value
  await loadTransactionDetail()
}
</script>
<style scoped>

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

.address {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
