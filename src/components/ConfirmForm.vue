<template>
  <div class="confirm-form">

    <h3>5. Confirm Tx</h3>
    <div>Tx proposed by Signer 1 will by confirmed by Signer 2 to get consensus</div>
    <button @click="$emit('confirm-clicked')">Confirm Tx</button>
    or
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  // todo only confirm by me
  name: 'ConfirmForm',

  data: () => ({
    valName: null,
  }),
}
</script>

<style scoped>
.confirm-form {

}
</style>
