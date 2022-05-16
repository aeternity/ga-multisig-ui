<template>
  <div class="about">
    <h2>My Contracts</h2>
    <router-link to="/create">+ Create Multisig Contract</router-link>

    <!--todo fix load in the first time - wait for wallet-->
    <div v-if="address && !walletStatus">
      <div v-for="contract in myContracts">
        <div>
          {{ contract.contractId }}
          <button @click="loadContract(contract.gaAddress, contract.gaSecret)">
            Load info
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
// todo pages as setup

import { Universal, Node } from '@aeternity/aepp-sdk'
import { loadMyContracts, updateContractInfo, restoreContractsFromDB } from "../store"
import { aeWallet } from '../utils/aeternity'


import { COMPILER_URL } from "../utils/aeternity/configs"

export default {
  name: 'Load',
  data: () => ({
    myContracts: null,
    contractDetail: null,
    todoName: '',
    todos: [],
    isLoaded: false,
  }),

  async mounted () {
    await restoreContractsFromDB()
    this.myContracts = await loadMyContracts()
  },
  watch: {
   async walletStatus (newValue) {
      console.log('walletStatus', newValue)
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
  methods: {
    async loadContract (gaAddress, gaSecret) {
      const signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
      })
      await updateContractInfo(signerSdk, gaAddress, gaSecret)
    },
  },
}
</script>

