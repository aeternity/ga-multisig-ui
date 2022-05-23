import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { COMPILER_URL } from "../utils/aeternity/configs"
import { restoreContractsFromDB } from "./offChainDB"
import { Node, Universal } from '@aeternity/aepp-sdk'

export const app = reactive({
  multisigContracts: null,
  myContracts: null,
  isAppHydrated: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, myContracts, multisigContracts } = toRefs(app)
  multisigContracts.value = await restoreContractsFromDB()
  myContracts.value = await getMyContracts()
  isAppHydrated.value = true
}

export const getMyContracts = async () => {
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(app)

  return multisigContracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getContractByContractId = (contractId) => {
  // todo think of better usage
  const { multisigContracts } = toRefs(app)
  return multisigContracts.value.find(contract =>
    contract.contractId === contractId,
  )
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
