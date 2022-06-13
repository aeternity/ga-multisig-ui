<template>
  <div class="send-form">
    <hr>
    <h3>Send TX</h3>
    <br>
    <div v-if="!isMultisigAccountCharged && hasConsensus">
      <p>Multisig account needs to be charged to be able to fund send transaction</p>
<!--      todo remove pre-charge-->
      <button @click="$emit('charge-clicked')">
        Pre-charge Multisig account
      </button>
      <br>
      <br>
    </div>

    <div>
      {{
        // todo improve condition
        hasConsensus ?
          'Send proposed and confirmed tx to recipient account' :
          'Waiting for confirmations from other users'
      }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
}
</script>
