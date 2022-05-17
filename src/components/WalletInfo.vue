<template>
  <div class="wallet">
    <div v-if="address && !walletStatus" class="wallet-info">
      <strong>Connected Address </strong>
      <div class="wallet-address">{{ address }}</div>
      <br/>
      <h6>Contract Info</h6>
      contract address: {{ gaPubKey }}
      <br>
      version: {{ version }}
      <br>
      confirmations: {{ confirmations }} / {{ confirmationsRequired }}
      <br>
      signers: {{ signers }}
      <br>
      confirmedBy: {{ confirmedBy }}
      <br>
      txHash: {{ txHash }}
      <br>
      proposedAmount: {{ proposedAmount }}
      <br>
      recipientAddress: {{ recipientAddress }}
      <br>
      <hr>
      <br>
      isCurrentUserSigner: {{ isCurrentUserSigner }}
      <br>
      hasProposedTx: {{ hasProposedTx }}
      <br>
      hasConsensus: {{ hasConsensus }}
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
  hasProposedTx,
  isCurrentUserSigner,
  cId,
  txHash,
  proposedAmount,
  gaPubKey,
  recipientAddress,
  confirmedBy
} = toRefs(multisig)
</script>

<style scoped>
.wallet {

  width: 320px;
  position: fixed;
  top: 0;
  right: 0;

  margin: 0 auto;

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
