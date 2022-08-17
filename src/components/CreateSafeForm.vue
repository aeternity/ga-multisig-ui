<template>
  <div>
    <h3>&#9312; Connect Wallet</h3>
    <div :class="[{'hidden': step !==1 }]">
      <button @click="connect">Connect</button>
      <br>
      Connected user: {{ address }}

      <div class="controls">
        <router-link to="/app">
          Cancel
        </router-link>
        <button
          @click="goToStep(2)"
          :disabled="!address">
          Continue
        </button>
      </div>
    </div>


    <h3>&#9313; Owners and confirmations</h3>
    <div :class="[{'hidden': step !==2 }]">
      <signers-form
        v-model:requiredSignersAmount="initConfirmationsRequired"
        v-model:signersList="initSigners"/>
      <div class="controls">
        <button @click="goToStep(1)">
          back
        </button>
        <button
          @click="goToStep(3)"
          :disabled="!isSignerFormFilled">
          Continue
        </button>
      </div>
    </div>


    <h3>&#9314; Review</h3>
    <div :class="[{'hidden': step !==3 }]">
      <strong>Any transactions requires the confirmation of:</strong>
      <br>
      {{ initConfirmationsRequired }} out of {{ initSigners.length }} signers
      <br>
      <br>

      <strong>Signers List</strong>

      <ul>
        <li v-for="signer in initSigners">
          <strong>
            {{ signer }}
          </strong>
          <br>
        </li>
      </ul>
      <br>
      <p>
        You're about to create a new Multisig safe on Aeternity and will have to confirm a transaction with your
        currently connected wallet. The creation will cost approximately 0.00000556 AE. The exact amount will be
        determined
        by your wallet.
        Approximate creation time: 5 mins
      </p>
      <br>

      <div class="controls">
        <button @click="goToStep(2)">
          back
        </button>
        <button @click="createSafe">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue'
import { initWallet, wallet } from '@/utils/aeternity'
import {app, initSafe} from "@/store"
import SignersForm from "./SignersForm"

const { address } = toRefs(wallet)
const { safes, currentSafeContractId } = toRefs(app)

const step = ref(1)

const initSigners = ref(['', ''])
const initConfirmationsRequired = ref(2)

const isSignerFormFilled = computed(() => initSigners.value[1].length && initConfirmationsRequired.value)

async function createSafe () {
  const { contractId, gaAccountId } = await initSafe(initSigners.value, initConfirmationsRequired.value)
  safes.value[contractId] = gaAccountId
  currentSafeContractId.value = contractId
}

async function connect () {
  await initWallet()
}

async function goToStep (index) {
  step.value = index
}
</script>
<style>

.controls {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-top: 20px;
}
</style>
