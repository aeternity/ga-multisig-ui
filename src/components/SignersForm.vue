<template>
  <div class="signers-form">
    <hr>
    <h3>2. Select Signers</h3>
    <label>Signer 1 </label><input type="text" v-model="signer1.publicKey"> (randomly generated)
    <!--    todo randomly generate as helper-->
    <!--    todo my address helper-->
    <br>
    <label>Signer 2 </label><input type="text" v-model="signer2.publicKey"> (randomly generated)
    <br>
    <label>Amount of signers</label><input type="text" v-model="signersAmount">
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
