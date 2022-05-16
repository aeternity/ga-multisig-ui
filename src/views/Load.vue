<template>
  <div class="about">
    <h1>Contracts where I am signer</h1>
    <!--todo fix load in the first time - wait for wallet-->
    <div v-for="contract in myContracts">
      <div>
        {{ contract.contractId }}
        <button @click="loadContract(contract.gaAddress, contract.gaSecret)">
          Load info
        </button>
      </div>

    </div>
  </div>
</template>

<script>
// todo pages as setup

import { Universal, Node } from '@aeternity/aepp-sdk'
import { loadMyContracts, updateContractInfo, restoreContractsFromDB } from "../store"

import { COMPILER_URL } from "../utils/aeternity/configs"

export default {
  name: 'Load',
  data: () => ({
    myContracts: null,
    contractDetail: null,
    todoName: '',
    todos: [],
  }),

  async mounted () {
    await restoreContractsFromDB()
    this.myContracts = await loadMyContracts()
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

