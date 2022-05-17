<template>
  <div class="about">
    <h2>My Contracts
      <router-link to="/create">
        <button>
          + Create Multisig Contract
        </button>
      </router-link>
    </h2>

    <!--todo fix load in the first time - wait for wallet-->
    <div v-if="address && !walletStatus">
      <div v-for="contract in myContracts">
        <router-link :to="`/detail/${contract.contractId}`">
          {{ contract.contractId }}
        </router-link>
      </div>
    </div>
  </div>
</template>
todo add loader

<script>
// todo pages as setup

import { loadMyContracts, restoreContractsFromDB } from "../store"
import { aeWallet } from '../utils/aeternity'

export default {
  name: 'Load',
  data: () => ({
    myContracts: null,
    contractDetail: null,
    todoName: '',
    todos: [],
    isLoaded: false,
  }),
// todo check this page for unused code
  async mounted () {
    await restoreContractsFromDB()
    this.myContracts = await loadMyContracts()
  },
  watch: {
    async walletStatus (newValue) {
      if (newValue === null) {
        // todo wait for wallet connection but make it better
        await restoreContractsFromDB()
        this.myContracts = await loadMyContracts()
      }
    },
  },
  computed: {
    walletStatus () {
      return aeWallet.walletStatus
    },
    address () {
      return aeWallet.address
    },
  },
}
</script>

