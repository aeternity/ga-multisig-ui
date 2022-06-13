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


export const storeSafeToDB = async (contractId, gaKeyPair, signers) => {
  try {
    await axios.post(safeUrl,
      {
        contractId,
        gaKeyPair,
        signers,
      })
    await hydrateApp()
  } catch (e) {
    console.error(e)
  }
}

export const storeTransactionToDB = async (contractId, recipientAddress, proposedAmount) => {
  try {
    const transaction = await axios.post(transactionUrl,
      {
        contractId,
        recipientAddress,
        proposedAmount,
      })

    await linkTransactionToSafe(contractId, transaction.data.id)

    await hydrateApp()
  } catch (e) {
    console.error(e)
  }
}

export const linkTransactionToSafe = async (contractId, transactionId) => {
  const safe = await getSafeDBIndex(contractId)

  try {
    await axios.patch(`${safeUrl}/${safe.id}`, {
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


export const patchRevokedBy = async (contractId, revokedBy) => {
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

export const patchSentBy = async (contractId, sentBy) => {
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

