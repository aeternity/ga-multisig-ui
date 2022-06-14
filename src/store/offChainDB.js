import axios from "axios"
import { hydrateApp } from './app'

const safeUrl = "http://localhost:3001/safes"
const transactionUrl = "http://localhost:3001/transactions"

export const getSafeDBIndex = async (contractId) => {
  const safes = await restoreSafesFromDB()
  return safes.find(safe =>
    safe.contractId === contractId,
  )
}

export const storeSafeToDB = async (contractId, safeKeyPair, signers) => {
  try {
    await axios.post(safeUrl,
      {
        contractId,
        safeKeyPair,
        signers,
      })
    await hydrateApp()
  } catch (e) {
    console.error(e)
  }
}

export const storeTransactionToDB = async (contractId) => {
  try {
    const createdTransaction = await axios.post(transactionUrl,
      {
        contractId, //todo this is not needed
        recipientAddress: null,
        proposedAmount: null,
      })
    await linkTransactionToSafe(contractId, createdTransaction.data.id)

    await hydrateApp()
  } catch (e) {
    console.error(e)
  }
}

export const linkTransactionToSafe = async (contractId, transactionId) => {
  const safe = await getSafeDBIndex(contractId)

  try {
    const linkedResult = await axios.patch(`${safeUrl}/${safe.id}`, {
      currentTransactionId: transactionId,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const restoreSafesFromDB = async () => {
  try {
    const res = await axios.get(safeUrl)
    return res.data
  } catch (e) {
    console.error(e)
  }
}

export const restoreTransactionsFromDB = async () => {
  try {
    const res = await axios.get(transactionUrl)
    return res.data
  } catch (e) {
    console.error(e)
  }
}

export const updateProposeTx = async (contractId, recipientAddress, proposedAmount) => {
  const safe = await getSafeDBIndex(contractId)

  try {
    const changedTransaction = await axios.patch(`${transactionUrl}/${safe.currentTransactionId}`, {
      recipientAddress,
      proposedAmount,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}
export const updateRevokedBy = async (contractId, revokedBy) => {
  const safe = await getSafeDBIndex(contractId)

  try {
    await axios.patch(`${transactionUrl}/${safe.currentTransactionId}`, {
      revokedBy,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const updateSentBy = async (contractId, sentBy) => {
  const safe = await getSafeDBIndex(contractId)
  try {
    await axios.patch(`${transactionUrl}/${safe.currentTransactionId}`, {
      sentBy,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

