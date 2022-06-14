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
  console.log('storeTransactionToDB', contractId)
  try {
    const createdTransaction = await axios.post(transactionUrl,
      {
        contractId, //todo this is not needed
        recipientAddress: null,
        proposedAmount: null,
      })
    console.log('createdTransaction.data.id', createdTransaction.data.id)
    await linkTransactionToSafe(contractId, createdTransaction.data.id)

    await hydrateApp()
  } catch (e) {
    console.error(e)
  }
}

export const linkTransactionToSafe = async (contractId, transactionId) => {
  console.log('linking contractid', contractId)
  const safe = await getSafeDBIndex(contractId)
  console.log('linking safe', safe)
  console.log('linking safe.id', safe.id)

  try {
    const linkedResult = await axios.patch(`${safeUrl}/${safe.id}`, {
      currentTransactionId: transactionId,
    })
    console.log('linkedResult', linkedResult)
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
  console.log('updateProposeTx', contractId, recipientAddress, proposedAmount)
  const safe = await getSafeDBIndex(contractId)

  console.log('safe', safe)
  console.log('safe.currentTransactionId', safe.currentTransactionId)
  try {
    const changedTransaction = await axios.patch(`${transactionUrl}/${safe.currentTransactionId}`, {
      recipientAddress,
      proposedAmount,
    })
    console.log('changedTransaction', changedTransaction)
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

