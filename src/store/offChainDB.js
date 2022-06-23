import axios from "axios"
import { app, getTransactionByContractId, hydrateApp } from './app'
import { toRefs } from "vue"

const transactionUrl = "http://localhost:3001/transactions"
const { transactions } = toRefs(app)

export async function storeTransactionToDB (contractId) {
  try {
    await axios.post(transactionUrl,
      {
        contractId,
        recipientAddress: null,
        proposedAmount: null,
      })

    transactions.value = await restoreTransactionsFromDB()
  } catch (e) {
    console.error(e)
  }
}

export async function restoreTransactionsFromDB () {
  try {
    const res = await axios.get(transactionUrl)
    return res.data
  } catch (e) {
    console.error(e)
  }
}

export async function clearTransactionData (contractId) {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      sentBy: null,
      revokedBy: null,
      recipientAddress: null,
      proposedAmount: null,
    })
    transactions.value = await restoreTransactionsFromDB()

  } catch (e) {
    console.error(e)
  }
}

export async function updateProposeTx (contractId, recipientAddress, proposedAmount) {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      recipientAddress,
      proposedAmount,
    })
    transactions.value = await restoreTransactionsFromDB()

  } catch (e) {
    console.error(e)
  }
}

export async function updateRevokedBy (contractId, revokedBy) {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      revokedBy,
    })
    transactions.value = await restoreTransactionsFromDB()

  } catch (e) {
    console.error(e)
  }
}

export const updateSentBy = async (contractId, sentBy) => {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      sentBy,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}




