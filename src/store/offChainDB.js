import axios from "axios"
import { hydrateApp } from './app'

const dbURL = "http://localhost:3001/multisigContracts"

export const storeContractToDB = async (contractId, gaKeyPair, signers) => {
  try {
    await axios.post(dbURL,
      {
        contractId,
        gaKeyPair,
        signers,
      })
  } catch (e) {
    console.error(e)
  }
}

export const restoreContractsFromDB = async () => {
  try {
    const res = await axios.get(dbURL)
    return res.data
  } catch (e) {
    console.error(e)
  }
}

export const getDBIndex = async (contractId) => {
  const contracts = await restoreContractsFromDB()
  console.log('contracts', contracts)
  return contracts.find(contract =>
    contract.contractId === contractId,
  ).id
}


export const patchProposalByContractId = async (contractId, recipientAddress, proposedAmount) => {
  const id = await getDBIndex(contractId)

  try {
    await axios.patch(`${dbURL}/${id}`, {
      recipientAddress,
      proposedAmount,
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const patchRevokedStatus = async (contractId) => {
  const id = await getDBIndex(contractId)

  try {
    await axios.patch(`${dbURL}/${id}`, {
      isRevoked: true, //todo add by who
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

export const patchSentStatus = async (contractId) => {
  const id = await getDBIndex(contractId)
  try {
    await axios.patch(`${dbURL}/${id}`, {
      isSent: true, //todo add by who
    })
    await hydrateApp()

  } catch (e) {
    console.error(e)
  }
}

