<template>
  <div>
    <hr>
    <strong> Send</strong> {{ proposedAmount }} Aettos to:
    <br>
    {{ recipientAddress }}
    <br>
  </div>
</template>
<script>
export default {
  name: 'propose-list',
  props: ['proposedAmount', 'recipientAddress'],
}
</script>
