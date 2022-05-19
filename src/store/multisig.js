import { Node, Universal } from '@aeternity/aepp-sdk'
import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import { getContractByGaAddress, restoreContractsFromDB } from "./off-chainDB"
import { COMPILER_URL } from "../utils/aeternity/configs"


export const app = reactive({
  myContracts: null,
})

export const multisig = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
  hasProposedTx: null,
  hasConsensus: null,
  isCurrentUserSigner: null,
  multisigContracts: null, // todo presunout do druhzho modulu k mycontracts??
  txHash: null,
  proposedAmount: null,
  recipientAddress: null,
  gaPubKey: null,
  gaSecret: null,
  confirmedBy: null,
  contractId: null,
  isConfirmedByCurrentUser: null,
  isAppHydrated: false,
  isRevoked: false,
  isSent: false,
})

export const updateContractInfo = async () => {
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
    recipientAddress,
    gaPubKey,
    gaSecret, //todo rename
    confirmedBy,
    contractId,
    isConfirmedByCurrentUser,
    isRevoked,
    isSent,
  } = toRefs(multisig)
  const { address } = toRefs(aeWallet)
  const signerSdk = await getUniversalStamp()

  const contractAccount = await signerSdk.getAccount(gaPubKey.value)
  // todo isolate to function
  // todo fix je vubec potreba contractaddress ?
  // todo nejde to udelat rovnou s  contractId namisto gaPubKey?
  const contractInstance = await signerSdk.getContractInstance({
    source: multisigContract, contractAddress: contractAccount.contractId,
  })
  contractId.value = contractAccount.contractId

  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult

  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)

  txHash.value = consensus.tx_hash

  isCurrentUserSigner.value = signers.value.includes(address.value)
  hasProposedTx.value = !!confirmations.value
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by
  isConfirmedByCurrentUser.value = confirmedBy.value.includes(address.value)

  const offChainProposeData = getContractByGaAddress(gaPubKey.value)
  if (hasProposedTx.value) {

    proposedAmount.value = offChainProposeData.proposedAmount
    recipientAddress.value = offChainProposeData.recipientAddress

  }
  isRevoked.value = offChainProposeData?.isRevoked
  isSent.value = offChainProposeData?.isSent
}

export const hydrateApp = async () => {
  const { isAppHydrated } = toRefs(multisig)
  const { myContracts } = toRefs(app)
  await restoreContractsFromDB()
  myContracts.value = await loadMyContracts()
  isAppHydrated.value = true
}


export const loadMyContracts = async () => {
  // todo separate to detail a nd list
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(multisig)


  return multisigContracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getUniversalStamp = async () => {
  // todo node from variable
  const node = await Node({ url: 'https://testnet.aeternity.io' })

  return await Universal({
    nodes: [{
      name: 'testnet',
      instance: node,
    }],
    compilerUrl: COMPILER_URL,
  })
}

export const clearState = () => {
  const {
    version,
    confirmations,
    confirmationsRequired,
    signers,
    hasProposedTx,
    hasConsensus,
    isCurrentUserSigner,
    txHash,
    proposedAmount,
    recipientAddress,
    gaPubKey,
    gaSecret, //todo rename
    confirmedBy,
    contractId,
    isConfirmedByCurrentUser,
    isRevoked,
    isSent,
  } = toRefs(multisig)

  version.value = null
  confirmations.value = null
  confirmationsRequired.value = null
  signers.value = null
  hasProposedTx.value = null
  hasConsensus.value = null
  isCurrentUserSigner.value = null
  txHash.value = null
  proposedAmount.value = null
  recipientAddress.value = null
  gaPubKey.value = null
  gaSecret.value = null
  confirmedBy.value = null
  contractId.value = null
  isConfirmedByCurrentUser.value = null
  isRevoked.value = null
  isSent.value = null
}
