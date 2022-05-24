<template>
  <div class="signers-form">
    <hr>
    <h3>Select Signers</h3>
    <small>
      My addres #1 <i>ak_2QwV57qAR1rPqWfX4smiTXTn6Gp3aRd2q7boGxJy74wEMn85N7</i>
      <br>
      My addres #2 <i>ak_2JUjxGNfpVCov7SGTZdPGWW5XUZmuPwqbZsD9LaReEceFusbhU</i>
    </small>
    <ul>
      <li v-for="(signer, index ) in signersList"
          class="signers-item">
        <input
          placeholder="Signer address"
          type="text"
          :value="signer"
          @input="update($event, index)">
        <span
          class="signers-close"
          v-if="index > 1"
          @click="removeInput(index)">
          &#9587;
        </span>
      </li>
    </ul>


    <button @click="addInput">+ Add signer</button>
    <br>
    <br>
    Required count:
    <select
      :value="requiredSignersAmount"
      @input="$emit('update:requiredSignersAmount', $event.target.value)">
      <option selected disabled value="">Please select one</option>
      <template v-for="( signer, index ) in signersList">
        <option v-if="index > 0" :value="index + 1">
          {{ index + 1 }}
        </option>
      </template>
    </select>
    <br>
    <br>
    <button
      @click="$emit('create-clicked')">
      Create Account
    </button>
  </div>
</template>
<script>
export default {
  name: 'signers-form',
  props: ['signersList', 'requiredSignersAmount'],

  methods: {
    addInput () {
      this.signersList.push('')
    },
    removeInput (index) {
      this.signersList.splice(index, 1)
      if (this.requiredSignersAmount > this.signersList.length) {
        this.$emit('update:requiredSignersAmount', this.signersList.length)
      }
    },
    update (event, index) {
      const modifiedList = this.signersList
      modifiedList[index] = event.target.value
      this.$emit('update:signersList', modifiedList)
    },
  },
}
</script>

<style>
.signers-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.signers-close {
  position: relative;
  bottom: 8px;
  cursor: pointer;
}
</style>
