import axios from "axios"
import { getTransactionByContractId, hydrateApp } from './app'

const transactionUrl = "http://localhost:3001/transactions"

export const getSignersContracts = async (signerAddress) => {
  console.log('signerAddress', signerAddress)
  try {
    let { data } = await axios.get(`https://multisig-backend.aeternity.art/${signerAddress}?fromHeight=618542`)
    return data

  } catch (e) {
    console.error(e)
  }
}

export const storeTransactionToDB = async (contractId) => {
  try {
    await axios.post(transactionUrl,
      {
        contractId,
        recipientAddress: null,
        proposedAmount: null,
      })

    await hydrateApp()
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

// todo come up with better naming
export const clearTransactionData = async (contractId) => {
  const transaction = await getTransactionByContractId(contractId)
  console.log('transaction', transaction)
  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      sentBy: null,
      revokedBy: null,
      recipientAddress: null,
      proposedAmount: null,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}


export const updateProposeTx = async (contractId, recipientAddress, proposedAmount) => {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      recipientAddress,
      proposedAmount,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const updateRevokedBy = async (contractId, revokedBy) => {
  const transaction = await getTransactionByContractId(contractId)

  try {
    await axios.patch(`${transactionUrl}/${transaction.id}`, {
      revokedBy,
    })
    await hydrateApp()

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




