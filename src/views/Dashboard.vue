<template>
  <div class="detail" v-if="gaKeyPair">
    <h2>Safe Detail</h2>

    <signers-list
      :contract-id="safeId"
      :ga-public-key="gaKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <!--    <confirmation-list-->
    <!--      :class="[{'disabled': signers && !confirmedBy}]"-->
    <!--      :confirmations="confirmations"-->
    <!--      :confirmations-required="confirmationsRequired"-->
    <!--      :confirmations-map="confirmationsMap"/>-->

    <h2>Transaction</h2>

    <transaction/>
    <br>

    <!--    <router-link to="/create-transaction">-->
    <!--      <button>New Transaction</button>-->
    <!--    </router-link>-->

    <!--  <loader-image v-else/>-->
  </div>
</template>

<script setup>
import { app, hydrateApp, loadSafeDetail, safeDetail } from '../store'


import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"
import Transaction from "../components/Transaction"

const {
  address,
} = toRefs(aeWallet)

const route = useRoute()
const {
  gaKeyPair,
  safeId,
  version,
  nonce,
  transactions,
} = toRefs(safeDetail)

const { isAppHydrated } = toRefs(app)


onMounted(async () => {
  // clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await loadSafeDetail(safeId.value)
})

</script>
