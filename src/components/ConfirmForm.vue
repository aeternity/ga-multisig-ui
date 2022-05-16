<template>
  <div class="confirm-form">
    <hr>

    <h3>3. Confirm Tx</h3>

    <button @click="$emit('confirm-clicked')">Confirm Tx</button>
    or
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  // todo only confirm by me
  name: 'ConfirmForm',
}
</script>

<style scoped>
.confirm-form {

}
</style>
