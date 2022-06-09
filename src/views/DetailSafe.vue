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

    <h3>List of open transactions for this safe</h3>

    <ul v-for="transaction in transactions">
      <li>
        <router-link :to="`/transaction-detail/${transaction.id}`">
          {{ transaction.id }}
          <br>
          proposed amount: {{ transaction.proposedAmount }}
          <br>
          recipient Address: {{ transaction.recipientAddress }}
        </router-link>
      </li>
      <!--      todo more details (status) -->
    </ul>
    <br>

    <router-link to="/create-transaction">
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
  transactions,
} = toRefs(safeDetail)

const { isAppHydrated } = toRefs(app)


onMounted(async () => {
  clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }
  await loadSafeDetail(route.params.id)
})

</script>
