<template>
  <div class="wallet">
    <div v-if="address && !walletStatus" class="wallet-info">
      <strong>Connected Address </strong> <span class="wallet-address">{{ address }}</span>
      <br />
    </div>

    <img
      v-else
      src="../assets/loading_logo.svg"
      style="width: 50px"
    />
  </div>
</template>

<script>
import { defineComponent, toRefs } from 'vue'
import { aeWallet } from '../utils/aeternity'

export default defineComponent({
  name: 'WalletInfo',
  setup () {
    const { address, balance, walletStatus, activeWallet } = toRefs(aeWallet)
    // todo remove unused

    return { activeWallet, address, balance, walletStatus }
  }
})
</script>

<style scoped>
.wallet {
    display: flex;
    align-items: center;
    justify-content: space-around;
    margin: 0 auto;
    max-width: 600px;

    border: 2px solid #de3f6b;
    border-radius: 15px;
    padding: 20px;
}

.wallet-info {
    text-align: left;
}

.wallet strong {
    color: #de3f6b;
}
</style>
