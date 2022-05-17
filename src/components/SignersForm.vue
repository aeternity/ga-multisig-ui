<template>
  <div class="signers-form">
    <hr>
    <h3>1. Select Signers</h3>
    <small>
    My addres #1 <i>ak_2QwV57qAR1rPqWfX4smiTXTn6Gp3aRd2q7boGxJy74wEMn85N7</i>
    <br>
    My addres #2 <i>ak_2JUjxGNfpVCov7SGTZdPGWW5XUZmuPwqbZsD9LaReEceFusbhU</i>
    </small>
    <br>
    <br>
    <label>Signer 1 </label>
    <br>
    <input
      type="text"
      :value="signer1Key"
      @input="$emit('update:signer1Key', $event.target.value)">
    <br>
    <br>
    <label>Signer 2 </label>

    <br>
    <input
      type="text"
      :value="signer2Key"
      @input="$emit('update:signer2Key', $event.target.value)">
    <br>
    <br>
    <label>Amount of signers</label>
    <br>
    <input
      type="text"
      :value="requiredSignersAmount"
      @input="$emit('update:requiredSignersAmount', $event.target.value)"
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
export default {
  name: 'SignersForm',
  props: ['signer1Key', 'signer2Key', 'requiredSignersAmount'],
}
</script>
