import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { restoreContractsFromDB } from "./offChainDB"

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
  console.log('hydrated')
}

export const getMyContracts = async () => {
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(app)

  return multisigContracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getContractByAddress = (gaAddress) => {
  const { multisigContracts } = toRefs(app)
  return multisigContracts.value.find(contract =>
    contract.gaKeyPair.publicKey === gaAddress
  )
}

export const getContractByContractId = (contractId) => {
  const { multisigContracts } = toRefs(app)
  return multisigContracts.value.find(contract =>
    contract.contractId === contractId,
  )
}
