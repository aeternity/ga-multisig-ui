<template>
  <div class="wallet">
    <div v-if="address && !walletStatus" class="wallet-info">
      <strong>Connected Address </strong> <span class="wallet-address">{{ address }}</span>
      <br/>
    </div>

    <img
      v-else
      src="../assets/loading_logo.svg"
      style="width: 50px"
    />
    <br>
    <h6>Contract Info</h6>
    version: {{ version }}
    <br>
    confirmations:  {{ confirmations }} / {{ confirmationsRequired }}
    <br>
    signers: {{ signers }}
  </div>
</template>

<script>
import { defineComponent, toRefs } from 'vue'
import { aeWallet } from '../utils/aeternity'
import { multisig } from '../store'

export default defineComponent({
  name: 'WalletInfo',
  setup () {
    const { address, balance, walletStatus, activeWallet } = toRefs(aeWallet)
    const { version, confirmations,confirmationsRequired, signers } = toRefs(multisig)
    // todo remove unused
// todo setup?
    return { activeWallet, address, balance, walletStatus, version, confirmations, confirmationsRequired, signers }
  },
})
</script>

<style scoped>
.wallet {

  margin: 0 auto;
  max-width: 600px;

  border: 2px solid #de3f6b;
  border-radius: 15px;
  padding: 20px;
  background: #000;
}

.wallet-info {
  text-align: left;
}

.wallet strong {
  color: #de3f6b;
}
</style>
