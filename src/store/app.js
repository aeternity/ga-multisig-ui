import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { getSignersContracts, restoreTransactionsFromDB } from "./offChainDB"

export const app = reactive({
  mySafes: null,
  isAppHydrated: false,
  transactions: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, mySafes, transactions } = toRefs(app)
  const { address } = toRefs(aeWallet)

  transactions.value = await restoreTransactionsFromDB()
  mySafes.value = await getSignersContracts(address.value)

  isAppHydrated.value = true
}

export const getTransactionByContractId = (contractId) => {
  const { transactions } = toRefs(app)
  return transactions.value.find(transaction =>
    transaction.contractId === contractId,
  )
}
