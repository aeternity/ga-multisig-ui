<template>
  <div class="propose-form">
    <h3>2. Propose Tx</h3>
    <label>Recipient </label>
    <br>
    <input type="text" disabled v-model="recipientKey"> (randomly generated)
    <br>
    <br>
    <label>Propose amount </label>
    <br>
    <input type="text" disabled v-model="proposedAmount"> Aettos
    <br>
    <button @click="$emit('propose-clicked')">Propose</button>
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
