import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import { getContractByGaAddress } from "./offChainDB"
import { getUniversalStamp } from "./app"

export const contractDetail = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
  hasProposedTx: null,
  hasConsensus: null,
  isCurrentUserSigner: null,
  txHash: null,
  proposedAmount: null,
  recipientAddress: null,
  gaPubKey: null,
  gaSecret: null,
  confirmedBy: null,
  contractId: null,
  isConfirmedByCurrentUser: null,
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
  } = toRefs(contractDetail)
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
  } = toRefs(contractDetail)

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
