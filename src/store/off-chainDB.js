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
  } catch (e) {
    console.error(e)
  }
}

export const restoreContractsFromDB = async () => {
  const { multisigContracts } = toRefs(multisig)
  try {
    const res = await axios.get(dbURL)
    multisigContracts.value = res.data
  } catch (e) {
    console.error(e)
  }
}



