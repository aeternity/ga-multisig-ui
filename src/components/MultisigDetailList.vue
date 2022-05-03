<template>
  <div class="multisig-detail-list">
      <br>

    <br>
    <strong>Confirmed Consensus Info</strong>
    <br> Confirmations: {{ confirmedInfo.confirmed_by.length }} / {{ Number(confirmedInfo.confirmations_required) }}
    <br> Has consensus: {{ confirmedInfo.has_consensus }}
    <br>
    <br>
    <strong> TX Hash:</strong>
    <br>
    {{ testSpendTx }}}
    <br>
    <br>
    <strong> Signers:</strong>
    <ul>
      <li v-for="signer in confirmedInfo.confirmed_by" :key="signer">{{ signer }}</li>
    </ul>
    <br>


    <strong> Proposed Consensus Info</strong>
      <br> Confirmations: {{ loadedContractInfo.confirmed_by.length }} /
      {{ Number(loadedContractInfo.confirmations_required) }}
      <br> Has consensus: {{ loadedContractInfo.has_consensus }}
      <br>
      <br>
      <strong> Signers:</strong>
      <ul>
        <li v-for="signer in loadedContractInfo.confirmed_by" :key="signer">{{ signer }}</li>
      </ul>
      <br>
    <strong> TX Hash:</strong>
    <br>
    {{ testSpendTx }}
    <strong> Version:</strong>
    <br>
    {{ version }}
    <br>
  </div>
</template>

<script>
export default {
  name: 'MultisigDetailList',
  props: {
    propName: {
      type: Boolean,
      required: true,
    },
  },
  data: () => ({
    valName: null,
  }),
}
</script>

<style scoped>
.multisig-detail-list {

}
</style>
