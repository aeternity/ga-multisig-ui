import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import { getContractByGaAddress } from "./offChainDB"
import { getUniversalStamp } from "./app"

export const contractDetail = reactive({
  // todo sort on all other places
  gaPubKey: null,
  gaSecret: null,
  contractId: null,
  contractAccount: null,
  contractInstance: null,

  hasProposedTx: null,
  hasConsensus: null,
  isRevoked: false,
  isSent: false,
  isConfirmedByCurrentUser: null,
  isCurrentUserSigner: null,

  signers: null,
  proposedAmount: null,
  recipientAddress: null,
  confirmations: null,
  confirmationsRequired: null,
  confirmedBy: null,
  txHash: null,
  version: null,
})

export const updateContractInfo = async () => {
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
    gaPubKey,//todo rename
    gaSecret,
    confirmedBy,
    contractId,
    isConfirmedByCurrentUser,
    isRevoked,
    isSent,
    contractAccount,
    contractInstance,
  } = toRefs(contractDetail)
  const { address } = toRefs(aeWallet)
  const signerSdk = await getUniversalStamp()

  contractAccount.value = await signerSdk.getAccount(gaPubKey.value)
  // todo isolate to function to contract actions
  // todo fix je vubec potreba contractaddress ?
  // todo nejde to udelat rovnou s  contractId namisto gaPubKey?
  console.log('contractAccount.value', contractAccount.value)
  contractId.value = contractAccount.value.contractId

  contractInstance.value = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId.value,
  })
  console.log('contractInstance.value', contractInstance.value)


  signers.value = (await contractInstance.value.methods.get_signers()).decodedResult
  version.value = (await contractInstance.value.methods.get_version()).decodedResult

  const consensus = (await contractInstance.value.methods.get_consensus_info()).decodedResult
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
    gaPubKey, //todo rename
    gaSecret,
    confirmedBy,
    contractId,
    isConfirmedByCurrentUser,
    isRevoked,
    isSent,
    contractAccount,
    contractInstance,
  } = toRefs(contractDetail)

  // todo separate default values
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
  isRevoked.value = false
  isSent.value = false
  contractAccount.value = null
  contractInstance.value = null
}
