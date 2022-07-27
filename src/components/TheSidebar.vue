<template>
  <div class="sidebar" v-if="accountId">
    <ul>
      <li>
        My safes
        <safe-select/>
        <br>
        <router-link to="/app/open">
          <button>
            New Safe
          </button>
        </router-link>
        <hr>
      </li>

      <li class="user">
        <img :src="`https://avatars.z52da5wt.xyz/${accountId}`" alt="" width="100">
        <div class="address"> {{ accountId || 'not connected' }}</div>
      </li>

      <li>
        Balance
        <br>
        {{ balance }}
        <br>
        <router-link to="/app/top-up">
          Top up
        </router-link>
        <hr>
      </li>

      <li>
        <router-link :to="`/app/${contractId}`">
          <button>
            Home
          </button>
        </router-link>
      </li>

      <li>
        <a target="_blank" :href="`https://explorer.testnet.aeternity.io/account/${accountId}`">
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
import { wallet } from "@/utils/aeternity"
import { app, contractDetail } from "@/store"
import { useRoute, useRouter } from "vue-router"
import SafeSelect from "./SafeSelect"

const { walletStatus, address } = toRefs(wallet)
const { accountId, balance, contractId } = toRefs(contractDetail)

const route = useRoute()
const router = useRouter()
</script>

<style scoped>
.user {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar {
  padding: 8px;
}

.address {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
