import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { restoreSafesFromDB } from "./offChainDB"

export const app = reactive({
  multisigSafes: null,
  mySafes: null,
  isAppHydrated: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, mySafes, multisigSafes } = toRefs(app)
  const { address } = toRefs(aeWallet)

  multisigSafes.value = await restoreSafesFromDB()
  mySafes.value = getMySafes(multisigSafes, address)
  isAppHydrated.value = true
}

export const getMySafes = (contracts, address) => {
  return contracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getContractByAddress = (gaAddress) => {
  const { multisigSafes } = toRefs(app)
  return multisigSafes.value.find(contract =>
    contract.gaKeyPair.publicKey === gaAddress,
  )
}

export const getSafeByContractId = (contractId) => {
  console.log('getSafeByContractId contractId', contractId)
  const { multisigSafes } = toRefs(app)
  console.log('multisigSafes', multisigSafes)

  const aaa = multisigSafes.value.find(safe =>
    safe.contractId === contractId, //todo contractid vs safeid
  )
  console.log('aaa', aaa)
  return aaa
}
