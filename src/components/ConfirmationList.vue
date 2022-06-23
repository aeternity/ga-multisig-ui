<template>
  <div class="confirmation-list">
    <ul>
      <li v-for="confirmation in confirmationsMap">
        <strong>
          {{ confirmation.isConfirmed ? '&#x2705;' : '&#x274C' }}
        </strong>
        {{ confirmation.signer }}
        <br>

        <strong>{{ confirmation.chainName }} </strong>
        <br>
        <br>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'confirmation-list',
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
