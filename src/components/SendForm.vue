<template>
  <div class="send-form">
    <hr>
    <h3>Send TX</h3>
    <br>
    <div v-if="!isMultisigAccountCharged && hasConsensus">
      <p>Multisig accound needs to be charged to be able to fund send transaction</p>
      <button

        @click="$emit('charge-clicked')">
        Pre Charge Multisig account
      </button>
      <br>
      <br>
    </div>

    <div>
      {{
        hasConsensus ?
          'Send proposed and confirmed tx to recipient account' :
          'Waiting for confirmations from other users'
      }}
    </div>
    <br>
    <template v-if="hasConsensus && isMultisigAccountCharged">
      <button @click="$emit('send-clicked')">Send Tx</button>
      or
    </template>
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'SendForm',
  props: ['hasConsensus', 'isMultisigAccountCharged'],
}
</script>
