<template>
  <div>
    <hr>
    <strong> Send</strong> {{ toAe(proposedAmount) }} ae (Fee: {{ toAe(proposedFee) }} ae) to:
    <br>
    {{ recipientAddress }}
    <br>
  </div>
</template>
<script>
import { toAe } from "@aeternity/aepp-sdk";

export default {
  name: 'propose-list',
  props: ['proposedAmount', 'proposedFee', 'recipientAddress'],
  methods: {
    toAe: toAe
  }
}
</script>
