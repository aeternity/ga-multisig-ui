<template>
  <div>
    <strong>Multisig account address: </strong>
    <br>
    {{ gaPublicKey }}
    <br>
    <strong>Contract id: </strong>
    <br>
    {{ contractId }}
    <br>
    <strong>Contract version: </strong>
    <br>
    {{ version }}
    <br>
    <strong>Current nonce: </strong>
    <br>
    {{ nonce }}
  </div>
</template>
<script>
export default {
  name: 'signers-list',
  props: ['gaPublicKey', 'contractId', 'version', 'nonce'],
}
</script>
