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
import { contractDetail, loadContractDetail } from "../store"

const { account, balance, contractId } = toRefs(contractDetail)

const amount = ref(0)
const { sdk } = toRefs(aeWallet)

const topUp = async function () {
  console.log('account.value.publicKey', account.value.publicKey)
  console.log('amount.value', amount.value)
  await sdk.value.spend(amount.value, account.value.publicKey, {
    denomination: AE_AMOUNT_FORMATS.AE,
  })
  await loadContractDetail(contractId.value)
}
</script>
