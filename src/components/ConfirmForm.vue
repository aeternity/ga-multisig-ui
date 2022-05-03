<template>
  <div class="confirm-form">

    <h3>5. Confirm Tx</h3>
    <div>Tx proposed by Signer 1 will by confirmed by Signer 2 to get consensus</div>
    <button @click="confirmTx">Confirm Tx</button>
    or
    <button @click="revokeTx">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'ConfirmForm',
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
.confirm-form {

}
</style>
