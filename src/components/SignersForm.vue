<template>
  <div class="signers-form">
    <hr>
    <h3>2. Select Signers</h3>
    <label>Signer 1 </label>
    <button>Fill random address</button>
    <button>Fill my address</button>
    <br>
    <input type="text" v-model="signer1.publicKey">
    <!--    todo randomly generate as helper-->
    <!--    todo my address helper-->
    <br>
    <br>
    <label>Signer 2 </label>
    <button>Fill random address</button>
    <button>Fill my address</button>
    <br>
    <input type="text" v-model="signer2Key.publicKey">
    <br>
    <br>
    <label>Amount of signers</label>
    <br>
    <input type="text" v-model="signersAmount">
    <br>
    <br>
    <button @click="$emit('create-clicked')">Create Account</button>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'SignersForm',
  props: ['signer1', 'signer2'],
  data: () => ({
    signersAmount: 2,
  }),
}
</script>

<style scoped>
.signers-form {

}
</style>
