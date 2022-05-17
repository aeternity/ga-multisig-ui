<template>
  <div class="confirm-form">
    <hr>
    <h3>3. Confirm Tx</h3>
    <ul v-if="signers && confirmedBy">
<!--      todo move condition to page?-->
      <strong>Confirmations </strong> {{ confirmations }} / {{ confirmationsRequired }}
      <li v-for="signer in signers">
        <strong>
          {{ isConfirmedBy(signer) ? '&#x2705;': '&#x274C'}}
        </strong>
        {{ signer }}
      </li>
    </ul>
    <br>
    <button @click="$emit('confirm-clicked')">Confirm Tx</button>
    or
    <button @click="$emit('revoke-clicked')">Revoke Tx</button>
  </div>
</template>

<script>
export default {
  name: 'ConfirmForm',
  props: ['signers', 'confirmations', 'confirmationsRequired', 'confirmedBy'],
  methods: {
    isConfirmedBy (address) {
      // todo move higher
      return this.confirmedBy.includes(address)
    },
  },
}
</script>
