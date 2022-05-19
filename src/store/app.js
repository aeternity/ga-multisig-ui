import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { COMPILER_URL } from "../utils/aeternity/configs"
import { restoreContractsFromDB } from "./offChainDB"
import { Node, Universal } from '@aeternity/aepp-sdk'

export const app = reactive({
  myContracts: null,
  multisigContracts: null, //todo rename contractsList
  isAppHydrated: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, myContracts } = toRefs(app)
  await restoreContractsFromDB()
  myContracts.value = await loadMyContracts()
  isAppHydrated.value = true
}

export const loadMyContracts = async () => {
// todo try computed here
//   todo load je divny aspon prejmenovat
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(app)

  return multisigContracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getUniversalStamp = async () => {
  // todo node from variable
  const node = await Node({ url: 'https://testnet.aeternity.io' })

  return await Universal({
    nodes: [{
      name: 'testnet',
      instance: node,
    }],
    compilerUrl: COMPILER_URL,
  })
}
