import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { restoreSafesFromDB, restoreTransactionsFromDB } from "./offChainDB"

export const app = reactive({
  multisigSafes: null,
  mySafes: null,
  isAppHydrated: false,
  transactions: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, mySafes, multisigSafes, transactions } = toRefs(app)
  const { address } = toRefs(aeWallet)

  multisigSafes.value = await restoreSafesFromDB()
  transactions.value = await restoreTransactionsFromDB()
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
  const { multisigSafes } = toRefs(app)

  return multisigSafes.value.find(safe =>
    safe.contractId === contractId, //todo contractid vs safeid
  )
}

export const getTransactionBySafe = (contractId) => {
  const { transactions } = toRefs(app)

  return transactions.value.filter(transaction =>
    transaction.contractId === contractId, //todo contractid vs safeid
  )
}
