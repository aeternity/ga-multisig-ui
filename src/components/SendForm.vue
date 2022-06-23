<template>
  <div class="send-form">
    <hr>
    <h3>Send TX</h3>
    <br>

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
  props: ['hasConsensus'],
}
</script>
