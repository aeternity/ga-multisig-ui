<template>
  <div class="detail" v-if="gaKeyPair">
    <h2>Multisig Safe Detail</h2>

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

    <h3>List of transactions of this safe</h3>
    TBD
    <br>

    <router-link to="create-transaction">
      <button>New Transaction</button>
    </router-link>

    <!--  <loader-image v-else/>-->
  </div>
</template>

<script setup>
import { app, clearTransactionDetail, hydrateApp, loadSafeDetail, safeDetail } from '../store'


import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"

const {
  address,
} = toRefs(aeWallet)

const route = useRoute()
const {
  gaKeyPair,
  safeId,
  version,
  nonce,
} = toRefs(safeDetail)

const { isAppHydrated } = toRefs(app)


onMounted(async () => {
  clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }
  console.log('route.id', route.params.id)
  await loadSafeDetail(route.params.id)
})

</script>
