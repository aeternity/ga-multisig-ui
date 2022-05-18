<template>
  <div class="send-form">
    <hr>
    <h3>Send TX</h3>
    <div>
      {{
        isSendHidden ?
          'Waiting for confirmations from other users' :
          'Send proposed and confirmed tx to recipient account'
      }}
    </div>
    <br>
    <template v-if="!isSendHidden">
      <!--      todo better propo name-->
      <button @click="$emit('send-clicked')">Send Tx</button>
      or
    </template>
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
  props: ['isSendHidden'],
}
</script>

<style scoped>
.send-form {

}
</style>
