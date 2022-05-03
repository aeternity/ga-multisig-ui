<template>
  <div class="propose-form">
    <h3>4. Propose Tx</h3>
    <label>Recipient </label><input type="text" v-model="testRecipient.publicKey"> (randomly
    generated)
    <label>Propose amount </label><input type="text" v-model="proposedAmount"> Aettos
    <br>
    <button @click="proposeTx">Propose Tx</button>
  </div>
</template>

<script>
export default {
  name: 'ProposeForm',
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
.propose-form {

}
</style>
