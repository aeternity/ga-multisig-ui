<template>
    <div class="about">
        <h1>Contracts where I am signer</h1>
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
        <multisig-detail-list/>
      </div>
    </div>
</template>

<script>
import { loadMyContracts, loadContractDetail } from "../store"
import MultisigDetailList from "../components/MultisigDetailList"
export default {
  name: 'About',
  components: { MultisigDetailList },
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
