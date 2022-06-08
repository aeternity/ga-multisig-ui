<template>
  <h2>Create Safe</h2>
  <div v-if="creationStep1 || creationStep2 || creationStep3 || creationStep4 || creationStep5">

    <h3>Safe creation process</h3>
    <div>
      <br>
      {{ creationStep1 ? '&#9989;' : '&#9312;' }} preparing multisig safe

      <br>
      {{ creationStep2 ? '&#9989;' : '&#9313;' }} compiling smart contract

      <br>
      {{ creationStep3 ? '&#9989;' : '&#9314;' }} deploying smart contract

      <br>
      {{ creationStep4 ? '&#9989;' : '&#9315;' }} createing safe account
    </div>
    <router-link to="/my-safes">
      <button :disabled="!creationStep4">Get Started</button>
    </router-link>
  </div>

  <div v-else>
    <h3>&#9312; Connect Wallet</h3>
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


    <h3>&#9313; Owners and confirmations</h3>
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


    <h3>&#9314; Review</h3>
    <div :class="[{'hidden': step !==3 }]">
      <strong>Any transactions requires the confirmation of:</strong>
      <br>
      {{ initConfirmationsRequired }} out of {{ initSigners.length }} signers
      <br>
      <br>

      <strong>Signers List</strong>
      <!--      todo add signers list-->
      <br>
      <li v-for="signer in initSigners">
        <strong>
          {{ signer }}
        </strong>
        <br>
      </li>
      <br>
      <p>
        You're about to create a new Multisig safe on Aeternity and will have to confirm a transaction with your
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
        <button @click="createSafe">Create</button>

      </div>


      <div v-if="contractId">
        <h3>Success Multisig safe created!</h3>
      </div>
    </div>

  </div>
</template>

<script setup>

import SignersForm from "../components/SignersForm"
import { Crypto } from '@aeternity/aepp-sdk'

import { onMounted, ref, toRefs } from 'vue'
import { aeInitWallet, aeWallet } from '../utils/aeternity'
import { clearTransactionDetail, creationSteps, storeSafeToDB } from "../store"
import { initSafe, safeDetail } from "../store/safeDetail"

const {
  creationStep1,
  creationStep2,
  creationStep3,
  creationStep4,
  creationStep5,
} = toRefs(creationSteps)

onMounted(() => clearTransactionDetail())

const {
  address,
} = toRefs(aeWallet)

const {
  gaKeyPair,
  safeId,
} = toRefs(safeDetail)


const step = ref(1)

const initSigners = ref(['', '']) //todo move this to store
const initConfirmationsRequired = ref('')

async function createSafe () {
  gaKeyPair.value = Crypto.generateKeyPair()

  await initSafe(initSigners.value, initConfirmationsRequired.value, gaKeyPair.value)
  console.log('safeId.value', safeId.value)
  await storeSafeToDB(safeId.value, gaKeyPair.value, initSigners.value)
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
