<template>
  <h2>&#9312; Connect Wallet</h2>
  <div :class="[{'hidden': step !==1 }]">
    <button @click="connect">Connect</button>
    <br>
    Connected user: {{ address }}
    <div class="controls">
      <router-link to="/index">Cancel</router-link>
      <button
        @click="goToStep(2)"
        :disabled="!address">
        Continue
      </button>
    </div>
  </div>


  <h2>&#9313; Owners and confirmations</h2>
  <div :class="[{'hidden': step !==2 }]">
    <signers-form
      v-model:initConfirmationsRequired="initConfirmationsRequired"
      v-model:signersList="initSigners"/>
    <div class="controls">
      <button
        @click="goToStep(1)">
        back
      </button>
      <button
        @click="goToStep(3)"
        :disabled="!initSigners[1].length && initConfirmationsRequired">
        <!--        todo better condition-->
        Continue
      </button>
    </div>
  </div>


  <h2>&#9314; Review</h2>
  <div :class="[{'hidden': step !==3 }]">
    <strong>Any transactions requires the confirmation of:</strong>
    <br>
    {{ initConfirmationsRequired }} out of {{ initSigners.length }} signers
    <br>
    <br>

    <strong>Signers List</strong>
    <br>
    {{ initSigners }}
    <br>
    <p>
      You're about to create a new Multisig wallet on Aeternity and will have to confirm a transaction with your
      currently connected wallet. The creation will cost approximately 0.00000556 AE. The exact amount will be
      determined
      by your wallet.
      Approximate creation time: 5 mins
    </p><br>

    <div class="controls">
      <button
        @click="goToStep(2)">
        back
      </button>
      <button @click="createMultisigAccount">Create</button>

    </div>


    <div v-if="contractId">
      <h3>Success Multisig wallet created!</h3>
    </div>
  </div>
</template>

<script setup>

import SignersForm from "../components/SignersForm"
import { Crypto } from '@aeternity/aepp-sdk'

import { onMounted, ref, toRefs } from 'vue'
import { aeInitWallet, aeWallet } from '../utils/aeternity'
import {
  clearContractDetail,
  contractDetail,
  initMultisigContract,
  loadContractDetail,
  storeWalletToDB,
} from "../store"

onMounted(() => clearContractDetail())

const {
  address,
} = toRefs(aeWallet)

const {
  gaKeyPair,
  contractId,
} = toRefs(contractDetail)


const step = ref(1)

const initSigners = ref(['', '']) //todo move this to store
const initConfirmationsRequired = ref('')

async function createMultisigAccount () {
  gaKeyPair.value = Crypto.generateKeyPair()

  await initMultisigContract(initSigners.value, initConfirmationsRequired.value, gaKeyPair.value)
  await loadContractDetail()
  await storeWalletToDB(contractId.value, gaKeyPair.value, initSigners.value)
}

async function connect () {
  await aeInitWallet()
}

async function goToStep (index) {
  step.value = index
}
</script>


<style>
.hidden {
  display: none;
}

.controls {
  border-top: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-top: 20px;
}
</style>
