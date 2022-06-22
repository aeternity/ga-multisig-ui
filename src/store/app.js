import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { restoreTransactionsFromDB } from "./offChainDB"
import axios from "axios"

export const app = reactive({
  mySafes: null,
  isAppHydrated: false,
  transactions: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, mySafes, transactions } = toRefs(app)
  const { address } = toRefs(aeWallet)

  mySafes.value = await getSignersContracts(address.value)
  transactions.value = await restoreTransactionsFromDB()
  isAppHydrated.value = true
}

export const getTransactionByContractId = (contractId) => {
  const { transactions } = toRefs(app)
  return transactions.value.find(transaction =>
    transaction.contractId === contractId,
  )
}

export const getGaAccountIdByContractId = (contractId) => {
  const { mySafes } = toRefs(app)
  const safe = mySafes.value.find(safe =>
    safe.contractId === contractId,
  )
  return safe.gaAccountId
}

export const getSignersContracts = async (signerAddress) => {
  try {
    let { data } = await axios.get(`https://multisig-backend.aeternity.art/${signerAddress}?fromHeight=618542`)
    return data

  } catch (e) {
    console.error(e)
  }
}
