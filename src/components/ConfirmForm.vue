<template>
  <div class="confirm-form">
    <hr>
    <h3>Confirm or Revoke Tx</h3>
    <div v-if="isConfirmHidden">
      Waiting for confirmations from another users
      <br>
      <br>
    </div>
    <template v-else>
      <button @click="$emit('confirm-clicked')">Confirm Tx</button>
      or
    </template>
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>

export default {
  name: 'ConfirmForm',
  props: ['isConfirmHidden'],
}
</script>
