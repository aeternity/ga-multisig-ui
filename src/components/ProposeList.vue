<template>
  <div>
    <hr>
    <strong>Proposed amount</strong>
    <br>
    {{ proposedAmount }}
    <br>
    <br>
    <strong>recipient address</strong>
    <br>
    {{ recipientAddress }}
    <br>
    <br>
  </div>
</template>
<script>
export default {
  name: 'propose-list',
  props: ['proposedAmount', 'recipientAddress'],
}
</script>
