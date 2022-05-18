<template>
  <div class="confirmation-list">
    <h3>Confirmations</h3>
    <ul v-if="confirmedBy">
      <!--      todo get data from store not do logic in component-->
      <h4>{{ confirmations }} / {{ confirmationsRequired }}</h4>

      <li v-for="signer in signers">
        <strong>
          {{ isConfirmedBy(signer) ? '&#x2705;' : '&#x274C' }}
        </strong>
        {{ signer }}
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
    confirmedBy: {},
    signers: {},
  },
  methods: {
    isConfirmedBy (address) {
      // todo move higher
      return this.confirmedBy.includes(address)
    },
  },
}
</script>
