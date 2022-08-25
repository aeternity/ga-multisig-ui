<template>
  <div class="propose-form">
    <hr>
    <h3>Propose Tx</h3>
    <label>Recipient </label>
    <br>
    <input
      type="text"
      :value="recipientAddress"
      @input="$emit('update:recipientAddress', $event.target.value)">
    <br>
    <br>
    <label>Propose amount </label>
    <br>
    <input
      type="text"
      :value="proposedAmountAe"
      @input="$emit('update:proposedAmountAe', $event.target.value)">
    ae <button @click="$emit('max-amount-clicked')">~ max</button>
    <br>
    <button @click="$emit('propose-clicked')">Propose & Confirm</button>
  </div>
</template>

<script>
export default {
  name: 'ProposeForm',
  props: ['recipientAddress', 'proposedAmountAe'],
}
</script>
