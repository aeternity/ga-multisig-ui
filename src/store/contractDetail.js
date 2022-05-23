import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet } from "../utils/aeternity"
import { getContractByAddress, getUniversalStamp } from "./app"
import { getSpendTx } from "./contractActions"

const getInitialData = () => ({
  // todo sort on all other places
  gaKeyPair: null,
  contractId: null,
  contractAccount: null,
  contractInstance: null,

  hasProposedTx: null,
  hasConsensus: null,
  revokedBy: false,
  sentBy: false,
  isConfirmedByCurrentUser: null,
  isCurrentUserSigner: null,

  signers: null,
  proposedAmount: null,
  recipientAddress: null,
  confirmations: null,
  confirmationsRequired: null,
  confirmedBy: null,
  spendTx: null,
  txHash: null,
  version: null,
  confirmationsMap: null,
})

export const contractDetail = reactive(getInitialData())

export const clearState = () => {
  Object.assign(contractDetail, getInitialData())
}

export const updateContractInfo = async () => {
  // todo rename loadContractInfo and separate from reactive
  const {
    version,
    confirmations,
    confirmationsRequired,
    signers,
    hasProposedTx,
    hasConsensus,
    isCurrentUserSigner,
    txHash,
    spendTx,
    proposedAmount,
    recipientAddress,
    gaKeyPair,
    confirmedBy,
    contractId,
    isConfirmedByCurrentUser,
    revokedBy,
    sentBy,
    contractAccount,
    contractInstance,
    confirmationsMap,
  } = toRefs(contractDetail)

  const signerSdk = await getUniversalStamp()
  const { address } = toRefs(aeWallet)
  const offChainContractData = getContractByAddress(gaKeyPair.value.publicKey)

  contractAccount.value = await signerSdk.getAccount(gaKeyPair.value.publicKey)

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

  proposedAmount.value = offChainContractData?.proposedAmount
  recipientAddress.value = offChainContractData?.recipientAddress

  if (confirmedBy.value) {
    confirmationsMap.value = getConfirmationMap(signers.value, confirmedBy.value)
  }
  if (recipientAddress.value && proposedAmount.value) {
    spendTx.value = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  }

  revokedBy.value = offChainContractData?.revokedBy
  sentBy.value = offChainContractData?.sentBy
}

// todo some values here are just computed
export const getConfirmationMap = (signers, confirmedBy) => {
  return signers.map(signer => {
      return {
        'isConfirmed': confirmedBy.includes(signer),
        'signer': signer,
      }
    },
  )
}


