<template>
  <div>
    <strong>Topup safe </strong>
    <input type="number" v-model="amount">
    <button @click="topUp">top up</button>
    <br>
  </div>
</template>
<script setup>
import { aeWallet } from "../utils/aeternity"
import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk/es/utils/amount-formatter'
import { ref, toRefs } from "vue"
import { loadSafeDetail, safeDetail } from "../store"

const { safeKeyPair, balance, safeId } = toRefs(safeDetail)

const amount = ref(0)
const { sdk } = toRefs(aeWallet)


const topUp = async function () {
  await sdk.value.spend(amount.value, safeKeyPair.value.publicKey, {
    denomination: AE_AMOUNT_FORMATS.AE,
  })
  await loadSafeDetail(safeId.value)
}
</script>
