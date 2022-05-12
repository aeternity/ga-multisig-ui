<template>
  <div class="wallet">
    <div v-if="address && !walletStatus" class="wallet-info">
      <strong>Connected Address </strong>
      <div class="wallet-address">{{ address }}</div>
      <br/>
      <h6>Contract Info</h6>
      version: {{ version }}
      <br>
      confirmations: {{ confirmations }} / {{ confirmationsRequired }}
      <br>
      signers: {{ signers }}
      <br>
      hasConsensus: {{ hasConsensus }}
      <br>
      hasProposal: {{ hasProposal }}
      <br>
      isCurrentUserSigner: {{ isCurrentUserSigner }}
      <button >Resume</button>
    </div>

    <img
      v-else
      src="../assets/loading_logo.svg"
      style="width: 50px"
    />
  </div>
</template>

<script setup>
import { toRefs } from 'vue'
import { aeWallet } from '../utils/aeternity'
import { multisig } from '../store'

const { address, walletStatus } = toRefs(aeWallet)

const {
  version,
  confirmations,
  confirmationsRequired,
  signers,
  hasConsensus,
  hasProposal,
  isCurrentUserSigner,
} = toRefs(multisig)
</script>

<style scoped>
.wallet {

  margin: 0 auto;
  max-width: 600px;

  border: 2px solid #de3f6b;
  border-radius: 15px;
  padding: 20px;
  background: #000;
  font-size: 70%;
}

.wallet-info {
  text-align: left;
}

.wallet strong {
  color: #de3f6b;
}
</style>
