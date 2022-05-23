<template>
  <div class="confirmation-list">
    <h3>Confirmations</h3>
    <ul>
      <h4>{{ confirmations }} / {{ confirmationsRequired }}</h4>
      <li v-for="confirmation in confirmationsMap">
        <strong>
          {{ confirmation.isConfirmed ? '&#x2705;' : '&#x274C' }}
        </strong>
        {{ confirmation.signer }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'confirmation-list',
  props: {
    confirmations: {},
    confirmationsRequired: {},
    confirmationsMap: {},
  },
}
</script>
