<template>
  <div class="send-form">
    <hr>
    <h3>Send TX</h3>
    <div>
      {{
        hasConsensus ?
          'Send proposed and confirmed tx to recipient account' :
          'Waiting for confirmations from other users'
      }}
    </div>
    <br>
    <template v-if="hasConsensus">
      <button @click="$emit('send-clicked')">Send Tx</button>
      or
    </template>
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
  props: ['hasConsensus'],
}
</script>

<style scoped>
.send-form {

}
</style>
