<template>
  <div class="propose-form">
    <h3>2. Propose Tx</h3>
    <small>
      Recommended recipient <i>ak_2hz4zNpYjQsZY37wy8T15LLMx363pqzwR7KAD3bND2DvEvkWKK</i>
    </small>
    <br>
    <br>
    <label>Recipient </label>
    <br>


    <input
      type="text"
      :value="recipientKey"
      @input="$emit('update:recipientKey', $event.target.value)">

    <br>
    <br>
    <label>Propose amount </label>
    <br>
    <input
      type="text"
      :value="proposedAmount"
      @input="$emit('update:proposedAmount', $event.target.value)">
    Aettos
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
