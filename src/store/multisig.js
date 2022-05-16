import { Node, Universal } from '@aeternity/aepp-sdk'
import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import axios from "axios"

export const multisig = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
  hasProposedTx: null,
  hasConsensus: null,
  isCurrentUserSigner: null,
  multisigContracts: null,
  txHash: null,
  proposedAmount: null,
  recipientKey: null,
  gaPubKey: null,
  gaSecret: null,
})


export const updateContractInfo = async (universal, gaAddress, gaSecretKey) => {
  const {
    // todo is this boilerplate neccessary?
    version,
    confirmations,
    confirmationsRequired,
    signers,
    hasProposedTx,
    hasConsensus,
    isCurrentUserSigner,
    txHash,
    proposedAmount,
    recipientKey,
    gaPubKey,
    gaSecret, //todo rename
  } = toRefs(multisig)
  const { address } = toRefs(aeWallet)

  const contractAccount = await universal.getAccount(gaAddress)
  // todo fix je vubec potreba contractaddress ?
  // todo nejde to udelat rovnou s  contractId namisto gaaddress?

  const contractInstance = await universal.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.contractId,
    },
  )
  gaPubKey.value = gaAddress // todo better naming
  gaSecret.value = gaSecretKey // todo better naming
  // confirmations.value = (await contractInstance.methods.get_consensus_info()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult

  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)

  console.log('XXX consensus', consensus)
  txHash.value = consensus.tx_hash

  isCurrentUserSigner.value = signers.value.includes(address.value)
  hasProposedTx.value = !!confirmations.value
  hasConsensus.value = consensus.has_consensus

  proposedAmount.value = hasProposedTx.value ? 1000 : null//todo connect this
  recipientKey.value = hasProposedTx.value ? 'ak_2hz4zNpYjQsZY37wy8T15LLMx363pqzwR7KAD3bND2DvEvkWKK' : null//todo connect this
}

export const loadMyContracts = async () => {
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(multisig)


  const myContracts = multisigContracts.value.filter(contract => {
    return contract.signers.includes(address.value)
  })
  return myContracts
}

export const getUniversalInstance = async () => {
  const node = await Node({ url: 'https://net.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'net', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
  })
  return signerSdk
}


// todo move to module
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

// todo move to another module
export const restoreContractsFromDB = async () => {
  const { multisigContracts } = toRefs(multisig)
  try {
    const res = await axios.get(dbURL)
    multisigContracts.value = res.data
  } catch (e) {
    console.error(e)
  }
}



