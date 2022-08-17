<template>
  <div class="confirmation-list">
    <ul>
      <li v-for="confirmation in confirmationsMap">
        <strong>{{ confirmation.isConfirmed ? '&#x2705;' : '&#x274C' }}</strong><br>
        <Wallet :address="confirmation.signer" />
        <br>
      </li>
    </ul>
  </div>
</template>
<script>
import Wallet from "@/components/Wallet";

export default {
  name: 'confirmation-list',
  components: {Wallet},
  props: {
    confirmationsMap: {},
  },
}
</script>

<style>
.confirmation-list {
  margin-left: 28px;
}
</style>
