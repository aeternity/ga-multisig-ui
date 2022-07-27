<template>
  <div>
    <strong>Topup safe </strong>
    <input type="number" v-model="amount">
    <button @click="topUp">top up</button>
    <br>
  </div>
</template>
<script setup>
import { wallet } from "../utils/aeternity"
import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk/es/utils/amount-formatter'
import { ref, toRefs } from "vue"
import { contractDetail, loadContractDetail } from "../store"

const { accountId, balance, contractId } = toRefs(contractDetail)

const amount = ref(0)
const { sdk } = toRefs(wallet)

async function topUp () {
  await sdk.value.spend(amount.value, accountId.value, {
    denomination: AE_AMOUNT_FORMATS.AE,
  })

  await loadContractDetail(contractId.value)
}
</script>
