<template>
  <div class="send-form">
    <hr>
    <h3>6. Send TX</h3>
    <div>Send proposed and confirmed tx to recipient account</div>
    <br>
    <button @click="$emit('send-clicked')">Send Tx</button>
    or
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
}
</script>

<style scoped>
.send-form {

}
</style>
