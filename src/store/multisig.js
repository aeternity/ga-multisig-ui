import { Crypto, MemoryAccount, Node, TxBuilderHelper, Universal } from '@aeternity/aepp-sdk'

import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { Buffer } from "buffer"
import { aeWallet } from "../utils/aeternity/wallet"
import axios from "axios"


export const multisig = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
  hasProposal: null,
  hasConsensus: null,
  isCurrentUserSigner: null,
  multisigContracts: null,
})
const dbURL = "http://localhost:3001/multisigContracts"


export const storeContractToDB = async (contractId, gaAddress, signers) => {
  try {
    await axios.post(dbURL,
      {
        contractId,
        gaAddress,
        signers,
      })
  } catch (e) {
    console.error(e)
  }
}
export const loadContractsFromDB = async () => {
  const { multisigContracts } = toRefs(multisig)
  console.log('loadContractsFromDB')
  try {
    const res = await axios.get(dbURL)
    multisigContracts.value = res.data
    console.log('multisigContracts.value', multisigContracts.value)
  } catch (e) {
    console.error(e)
  }
}

export const updateContractInfo = async (universal, publicKey) => {
  console.log('update')
  const {
    version,
    confirmations,
    confirmationsRequired,
    signers,
    hasProposal,
    hasConsensus,
    isCurrentUserSigner,
  } = toRefs(multisig)
  const { address } = toRefs(aeWallet)

  const contractAccount = await universal.getAccount(publicKey)
  // todo fix je vubec potreba contractaddress ?

  const contractInstance = await universal.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.contractId,
    },
  )
  // confirmations.value = (await contractInstance.methods.get_consensus_info()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult
  hasConsensus.value = (await contractInstance.methods.has_consensus()).decodedResult
  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  isCurrentUserSigner.value = signers.value.includes(address.value)
  hasProposal.value = !!confirmations.value
}

export const loadContractDetail = async (gaAddress) => {
  console.log('loadContractDetail', loadContractDetail)

  const signerSdk = getUniversalInstance()
  // todo nejde to udelat rovnou s  contractId namisto gaaddress?

  const contractAccount = await signerSdk.getAccount(gaAddress)

  const contractInstanceInitial = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  const loadedContractInfo = (await contractInstanceInitial.methods.get_consensus_info()).decodedResult
  console.log('loadedContractInfo', loadedContractInfo)
  return loadedContractInfo
}

export const loadMyContracts = async () => {
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(multisig)
  console.log('loadMyContracts', address)


  const myContracts = multisigContracts.value.filter(contract => {
    console.log('contract.signers', contract.signers)
    console.log('contract.signers.includes(address)', contract.signers.includes(address.value))
    return contract.signers.includes(address.value)
  })
  console.log('myContracts', myContracts)
  return myContracts
}

export const buildAuthTxHash = async (rlpTransaction) => {
  const { sdk } = toRefs(aeWallet)
  return new Uint8Array(
    Crypto.hash(Buffer.concat([
        Buffer.from(sdk.value.getNetworkId()),
        TxBuilderHelper.decode(rlpTransaction, 'tx'),
      ]),
    ),
  )
}


export const getUniversalInstance = async () => {
  const node = await Node({ url: 'https://net.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'net', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
  })
  return signerSdk
}


