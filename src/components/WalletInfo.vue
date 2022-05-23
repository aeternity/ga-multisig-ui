<template>
  <div class="wallet">
    <div v-if="address && !walletStatus" class="wallet-info">
      <div>Connected Address</div>
      <div class="wallet-address">{{ address }}</div>
      <div>Contract Info</div>
      Multisig account address: {{ gaKeyPair.publicKey }}
      <br>
      contract Id: {{ contractId }}
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
      spendTx: {{ spendTx }}
      <br>
      <hr>
      <br>
      isCurrentUserSigner: {{ isCurrentUserSigner }}
      <br>
      isConfirmedByCurrentUser: {{ isConfirmedByCurrentUser }}
      <br>
      hasProposedTx: {{ hasProposedTx }}
      <br>
      hasConsensus: {{ hasConsensus }}
      <br>
      isRevoked: {{ isRevoked }}
      <br>
      isSent: {{ isSent }}
    </div>

    <img
      v-else
      src="../assets/loading_logo.svg"
      style="width: 50px"
    />
  </div>
</template>

<!--todo remove this component at the end-->

<script setup>
import { toRefs } from 'vue'
import { aeWallet } from '../utils/aeternity'
import { contractDetail } from '../store'

const { address, walletStatus } = toRefs(aeWallet)

const {
  version,
  confirmations,
  confirmationsRequired,
  signers,
  hasConsensus,
  hasProposedTx,
  isCurrentUserSigner,
  isConfirmedByCurrentUser,
  txHash,
  proposedAmount,
  gaKeyPair,
  recipientAddress,
  confirmedBy,
  contractId,
  isRevoked,
  isSent,
  spendTx,
} = toRefs(contractDetail)
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
  padding: 5px;
  background: #000;
  font-size: 60%;
}

.wallet-info {
  text-align: left;
}

.wallet strong {
  color: #de3f6b;
}
</style>
