<template>
  <div class="about">
    <h1>Contracts where I am signer</h1>
    <!--todo fix load in the first time - wait for wallet-->
    <div v-for="contract in myContracts">
      <div>
        {{ contract.contractId }}
        <button @click="loadContract(contract.gaAddress)">
          Load info
        </button>
      </div>
    </div>
    <h3>Detail:</h3>
    <div>
      {{ contractDetail }}
      <!--        todo get status and resume action-->
      <button>Resume</button>
    </div>
  </div>
</template>

<script>
// todo pages as setup

import { Universal, Node } from '@aeternity/aepp-sdk'
import { loadMyContracts, updateContractInfo, loadContractsFromDB } from "../store"

import { COMPILER_URL } from "../utils/aeternity/configs"


export default {

  name: 'About',
  data: () => ({
    myContracts: null,
    contractDetail: null,
    todoName: '',
    todos: [],
  }),

  async mounted () {
    console.log('mount')
    await loadContractsFromDB()
    this.myContracts = await loadMyContracts()
  },


  methods: {
    async loadContract (contract) {
      const signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
      })

      updateContractInfo(signerSdk, contract)
    },
  },
}
</script>

<style>
.done {
  text-decoration: line-through;
}

</style>
