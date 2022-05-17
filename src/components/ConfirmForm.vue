<template>
  <div class="confirm-form">
    <hr>
    <h3>3. Confirm Tx</h3>
    <br>
    <ul>
      Confirmations
      <li></li>
    </ul>
    <br>
    <button @click="$emit('confirm-clicked')">Confirm Tx</button>
    or
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'ConfirmForm',
}
</script>
