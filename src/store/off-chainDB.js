import { toRefs } from 'vue'
import axios from "axios"
import { multisig } from '../store'

const dbURL = "http://localhost:3001/multisigContracts"

export const storeContractToDB = async (contractId, gaAddress, gaSecret, signers) => {
  try {
    await axios.post(dbURL,
      {
        contractId,
        gaAddress,
        gaSecret,
        signers,
      })
    // todo is it neccessary to store signers?
  } catch (e) {
    console.error(e)
  }
}

export const restoreContractsFromDB = async () => {
  const { multisigContracts } = toRefs(multisig) // todo this probably do in page
  try {
    const res = await axios.get(dbURL)
    multisigContracts.value = res.data
  } catch (e) {
    console.error(e)
  }
}


export const patchProposalByContractId = async (contractId, recipientAddress, proposedAmount) => {
// todo mozna predtim restore? anebo rovnou vytahnout z db?
  await restoreContractsFromDB()

  const contractById = getContractByContractId(contractId)

  try {
    await axios.patch(`${dbURL}/${contractById.id}`, {
      recipientAddress, //todo now we store recipiant key and secret Maybe we can store only recipiant key
      proposedAmount,
    });

    await restoreContractsFromDB()
  } catch (e) {
    console.error(e)
  }
}


export const patchRevokedStatus = async (contractId) => {
  await restoreContractsFromDB() //todo to much restoring?

  const contractById = getContractByContractId(contractId)

  try {
    await axios.patch(`${dbURL}/${contractById.id}`, {
      isRevoked: true, //todo add by who
    })

    await restoreContractsFromDB() //todo to much restoring?
  } catch (e) {
    console.error(e)
  }

}

export const patchSentStatus = async (contractId) => {
  await restoreContractsFromDB()

  const contractById = getContractByContractId(contractId)
  try {
    await axios.patch(`${dbURL}/${contractById.id}`, {
      isSent: true, //todo add by who
    })

    await restoreContractsFromDB() //todo to much restoring?
  } catch (e) {
    console.error(e)
  }
}


export const getContractByGaAddress = (gaAddress) => {
  //todo rovnou mozna vytahnout z DB
  const { multisigContracts } = toRefs(multisig)
  return multisigContracts.value.find(contract =>
    contract.gaAddress === gaAddress,
  )
}


export const getContractByContractId = (contractId) => {
  //todo rovnou mozna vytahnout z DB

  const { multisigContracts } = toRefs(multisig)
  return multisigContracts.value.find(contract =>
    contract.contractId === contractId,
  )
}
