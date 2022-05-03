<template>
    <div class="about">
        <h1>Contracts where I am signer</h1>
        <WalletInfo />
      <div v-for="contract in myContracts">
        <div>
          {{ contract }}
          <button @click="loadContractInfo(contract)">
            Load info
          </button>
        </div>
      </div>
      <h3>Detail:</h3>
      <div>
        {{ contractDetail }}
      </div>
    </div>
</template>

<script>
import WalletInfo from '../components/WalletInfo.vue'
import { loadMyContracts, loadContractDetail } from "../utils/aeternity"
export default {
  name: 'About',
  components: { WalletInfo },
  data: () => ({
    myContracts: null,
    contractDetail: null,
  }),
  async mounted () {
    this.myContracts = await loadMyContracts()
  },
  methods: {

    async loadContractInfo (contract) {
      this.contractDetail = await loadContractDetail(contract)
      console.log('contract', contract)
    },
  },
}
</script>
