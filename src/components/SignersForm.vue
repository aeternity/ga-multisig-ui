<template>
  <div class="signers-form">
    <hr>
    <h3>1. Select Signers</h3>
    <br>
    my second address
    <br>
    ak_2JUjxGNfpVCov7SGTZdPGWW5XUZmuPwqbZsD9LaReEceFusbhU
    <br>
    <label>Signer 1 </label>
<!--    todo fix propagating-->
    <button @click="fillRandomAddress('recipient1')">Fill random address</button>
    <button @click="fillMyAddress('recipient1')">Fill my address</button>
    <br>
    <!--    todo redo to computed-->
    <input
      type="text"
      :value="signer1Key"
      @input="$emit('update:signer1Key', $event.target.value)"
      ref="recipient1">
    <br>
    <br>
    <label>Signer 2 </label>
    <button @click="fillRandomAddress('recipient2')">Fill random address</button>
    <button @click="fillMyAddress('recipient2')">Fill my address</button>
    <br>
    <input
      type="text"
      :value="signer2Key"
      @input="$emit('update:signer2Key', $event.target.value)"
      ref="recipient2">
    <br>
    <br>
    <label>Amount of signers</label>
    <br>
    <input
      type="text"
      @input="$emit('update:requiredSignersAmount', $event.target.value)"
      :value="requiredSignersAmount"
    >
    <br>
    <br>
    <button
      @click="$emit('create-clicked')">Create Account
    </button>
    <hr>
  </div>
</template>

<script>
import { aeWallet } from '../utils/aeternity'
import { Crypto } from '@aeternity/aepp-sdk'

export default {
  name: 'SignersForm',
  props: ['signer1Key', 'signer2Key', 'requiredSignersAmount'],
  methods: {
    fillMyAddress (input) {
      this.$refs[input].value = aeWallet.address
    },
    fillRandomAddress (input) {
      this.$refs[input].value = Crypto.generateKeyPair().publicKey
    },
  }
}
</script>

<style scoped>
.signers-form {

}
</style>
