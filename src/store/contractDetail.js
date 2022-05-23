import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import { getContractByGaAddress } from "./offChainDB"
import { getUniversalStamp } from "./app"

const getInitialData = () => ({
  // todo sort on all other places
  gaKeyPair: null,
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
});

export const contractDetail = reactive(getInitialData())

export const clearState = () => {
  Object.assign(contractDetail, getInitialData())
}

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
    gaKeyPair,
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
  const offChainProposeData = getContractByGaAddress(gaKeyPair.value.publicKey)

  contractAccount.value = await signerSdk.getAccount(gaKeyPair.value.publicKey)
  // todo isolate to function to contract actions
  // todo fix je vubec potreba contractaddress ?
  // todo nejde to udelat rovnou s  contractId namisto gaPubKey?

  contractId.value = contractAccount.value.contractId

  contractInstance.value = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId.value,
  })

  signers.value = (await contractInstance.value.methods.get_signers()).decodedResult
  version.value = (await contractInstance.value.methods.get_version()).decodedResult
  const consensus = (await contractInstance.value.methods.get_consensus_info()).decodedResult

  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  txHash.value = consensus.tx_hash
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by

  hasProposedTx.value = !!confirmations.value
  isCurrentUserSigner.value = signers.value.includes(address.value)
  isConfirmedByCurrentUser.value = confirmedBy.value.includes(address.value)

  proposedAmount.value = offChainProposeData?.proposedAmount
  recipientAddress.value = offChainProposeData?.recipientAddress
  isRevoked.value = !!offChainProposeData?.isRevoked
  isSent.value = !!offChainProposeData?.isSent
}


