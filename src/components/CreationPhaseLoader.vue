<template>
  <h3>Safe creation process</h3>
  <div>
    <br>
    {{ creationPhase1 ? '&#9989;' : '&#9312;' }} preparing multisig safe
    <br>
    {{ creationPhase2 ? '&#9989;' : '&#9313;' }} compiling smart contract
    <br>
    {{ creationPhase3 ? '&#9989;' : '&#9314;' }} deploying smart contract
    <br>
    {{ creationPhase4 ? '&#9989;' : '&#9315;' }} creating safe account
    isCreated() {{ isCreated() }}
    <div v-if="isCreated()">
      <strong>Success Multisig safe created!</strong>
    </div>
  </div>
</template>
<script setup>
import { toRefs } from "vue"
import { creationPhases, isCreated } from "../store"

const {
  creationPhase1,
  creationPhase2,
  creationPhase3,
  creationPhase4,
} = toRefs(creationPhases)
</script>
