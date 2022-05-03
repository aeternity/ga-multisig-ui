<template>
  <div class="send-form">
    <hr>
    <h3>6. Send TX</h3>
    <div>Send proposed and confirmed tx to recipient account</div>
    <br>
    <button @click="sendTx">Send Tx</button>
    or
    <button @click="revokeTx">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
  props: {
    propName: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    valName: null,
  }),
}
</script>

<style scoped>
.send-form {

}
</style>
