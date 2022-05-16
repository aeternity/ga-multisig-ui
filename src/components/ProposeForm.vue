<template>
  <div class="propose-form">
    <h3>4. Propose Tx</h3>
    <label>Recipient </label>
    <input type="text" v-model="recipientKey"> (randomly generated)
    <label>Propose amount </label>
    <input type="text" v-model="proposedAmount"> Aettos
    <br>
    <button @click="$emit('propose-clicked')">Propose Tx</button>
  </div>
</template>

<script>
export default {
  name: 'ProposeForm',
  props: ['recipientKey', 'proposedAmount'],
  // todo rename to recipient address
}
</script>

<style scoped>
.propose-form {

}
</style>
