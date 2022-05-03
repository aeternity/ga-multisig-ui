<template>
  <div class="signers-form">
    <hr>
    <h3>2. Select Signers</h3>
    <label>Signer 1 </label><input type="text" v-model="signer1.publicKey"> (randomly generated)
    <br>
    <label>Signer 2 </label><input type="text" v-model="signer2.publicKey"> (randomly generated)
    <br>
    <label>Amount of signers</label><input type="text" v-model="signersAmount">
    <br>
    <hr>
  </div>
</template>

<script>
export default {
  name: 'SignersForm',
  props: {
    propName: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    valName: null,
  }),
}
</script>

<style scoped>
.signers-form {

}
</style>
