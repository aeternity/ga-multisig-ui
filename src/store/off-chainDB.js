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
  const { multisigContracts } = toRefs(multisig) // todo this probably do in page
  try {
    const res = await axios.get(dbURL)
    multisigContracts.value = res.data
  } catch (e) {
    console.error(e)
  }
}


export const patchProposalByContractId = async (contractId,recipientKey, proposedAmount) => {
// todo mozna predtim restore? anebo rovnou vytahnout z db?
  await restoreContractsFromDB()
  const { multisigContracts } = toRefs(multisig)

  const contractById = multisigContracts.value.find(contract => {
    return contract.contractId === contractId //todo can be shortened
  })

  console.log('contractById', contractById) //todo can be shortened

  try {
    await axios.patch(`${baseURL}/${contractById.id}`, {
      recipientKey,
      proposedAmount
    });

   await restoreContractsFromDB()

    // this.todos = this.todos.map(todo => {
    //   if (todo.id === id) {
    //     todo.done = true;
    //   }
    //
    //   return todo;
    // });
  } catch (e) {
    console.error(e);
  }
}




