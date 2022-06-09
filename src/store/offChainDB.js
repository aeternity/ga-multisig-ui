import axios from "axios"
import { hydrateApp } from './app'

const safeUrl = "http://localhost:3001/safes"
const transactionUrl = "http://localhost:3001/transactions"

export const getSafeDBIndex = async (contractId) => {
  const safes = await restoreSafesFromDB()
  return safes.find(contract =>
    safes.contractId === contractId,
  ).id
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
    await axios.post(transactionUrl,
      {
        contractId,
        recipientAddress,
        proposedAmount,
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
  const id = await getSafeDBIndex(contractId)

  try {
    await axios.patch(`${transactionUrl}/${id}`, {
      revokedBy,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const patchSentBy = async (contractId, sentBy) => {
  const id = await getSafeDBIndex(contractId)
  try {
    await axios.patch(`${transactionUrl}/${id}`, {
      sentBy,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

