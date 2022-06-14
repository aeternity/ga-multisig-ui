<template>
  <h3>Safe creation process</h3>
  <div>
    <br>
    {{ creationStep1 ? '&#9989;' : '&#9312;' }} preparing multisig safe
    <br>
    {{ creationStep2 ? '&#9989;' : '&#9313;' }} compiling smart contract
    <br>
    {{ creationStep3 ? '&#9989;' : '&#9314;' }} deploying smart contract
    <br>
    {{ creationStep4 ? '&#9989;' : '&#9315;' }} creating safe account

    <div v-if="creationStep4">
      <strong>Success Multisig safe created!</strong>
    </div>
  </div>
</template>
<script setup>
import { toRefs } from "vue"
import { creationSteps } from "../store"

const {
  creationStep1,
  creationStep2,
  creationStep3,
  creationStep4,
} = toRefs(creationSteps)
</script>
