<template>
  <h2>Create Safe</h2>
  <div v-if="isCreating()">
    <h3>&#9312; Connect Wallet</h3>
    <div :class="[{'hidden': step !==1 }]">
      <button @click="connect">Connect</button>
      <br>
      Connected user: {{ address }}
      <!--      todo componentize-->
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
        v-model:requiredSignersAmount="initConfirmationsRequired"
        v-model:signersList="initSigners"/>
      <div class="controls">
        <button
          @click="goToStep(1)">
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
        <button
          @click="goToStep(2)">
          back
        </button>
        <button @click="createSafe">Create</button>
      </div>
    </div>
  </div>

  <div v-else>
    <creation-phase-loader/>
    <button @click="getStarted" :disabled="!creationPhase4">Get Started</button>
  </div>
</template>

<script setup>
import SignersForm from "../components/SignersForm"
import { Crypto } from '@aeternity/aepp-sdk'

import { computed, ref, toRefs } from 'vue'
import { aeInitWallet, aeWallet } from '../utils/aeternity'
import {
  clearCreationSteps,
  creationPhases,
  initSafe,
  isCreating,
  loadSafeDetail,
  safeDetail,
  storeSafeToDB,
} from "../store"
import { useRouter } from "vue-router"
import CreationPhaseLoader from "../components/CreationPhaseLoader"

const {
  creationPhase1,
  creationPhase2,
  creationPhase3,
  creationPhase4,
} = toRefs(creationPhases)

const { address } = toRefs(aeWallet)
const { safeId } = toRefs(safeDetail)

const router = useRouter()

const step = ref(1)

const initSigners = ref(['', ''])
const initConfirmationsRequired = ref('')
const initSafeKeyPair = ref('')

const isSignerFormFilled = computed(() => initSigners.value[1].length && initConfirmationsRequired.value)

async function createSafe () {
  initSafeKeyPair.value = Crypto.generateKeyPair()
  const createdSafeId = await initSafe(initSigners.value, initConfirmationsRequired.value, initSafeKeyPair.value)
  await storeSafeToDB(createdSafeId, initSafeKeyPair.value, initSigners.value)
}

async function connect () {
  await aeInitWallet()
}

async function getStarted () {
  await loadSafeDetail(safeId.value) //todo is this neccessary?
  await router.push({ path: `/dashboard/${safeId.value}` })
  clearCreationSteps()
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
