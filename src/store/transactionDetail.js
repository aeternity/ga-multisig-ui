import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { reactive, toRefs } from 'vue'
import { aeWallet, getUniversalStamp } from "../utils/aeternity"
import { getSafeByContractId, getTransactionByDBIndex } from "./app"
import { getSpendTx } from "./contractActions"
import { resolveChainName } from "./chainNames"

const getInitialTransactionDetail = () => ({
  gaKeyPair: null,
  isMultisigAccountCharged: false,
  contractId: null,

  hasProposedTx: null,
  hasConsensus: null,
  revokedBy: null,
  sentBy: null,
  isConfirmedByCurrentUser: false,
  isCurrentUserSigner: false,

  signers: null,
  proposedAmount: null,
  recipientAddress: null,
  confirmations: null,
  confirmationsRequired: null,
  confirmationsMap: null,
  confirmedBy: null,
  spendTx: null,
  txHash: null,
  nonce: null, //todo reduce refs
  // todo where to store nonce
})

export const transactionDetail = reactive(getInitialTransactionDetail())

export const clearTransactionDetail = () => {
  Object.assign(transactionDetail, getInitialTransactionDetail())
}

export const loadTransactionDetail = async () => {
  const {
    gaKeyPair,
    isMultisigAccountCharged,
    contractId,
    hasProposedTx,
    hasConsensus,
    revokedBy,
    sentBy,
    isConfirmedByCurrentUser,
    isCurrentUserSigner,
    signers,
    proposedAmount,
    recipientAddress,
    confirmations,
    confirmationsRequired,
    confirmationsMap,
    confirmedBy,
    spendTx,
    txHash,
    nonce,
  } = toRefs(transactionDetail)
  const signerSdk = await getUniversalStamp()
  const { address } = toRefs(aeWallet)
  const contractAccount = await signerSdk.getAccount(gaKeyPair.value.publicKey)
  console.log('gaKeyPair.value.publicKey', gaKeyPair.value.publicKey)

  contractId.value = contractAccount.contractId

  const offChainSafeData = getSafeByContractId(contractId.value)
  const offChainTransactionData = getTransactionByDBIndex(offChainSafeData.currentTransactionId)

  const contractInstance = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId.value,
  })

  isMultisigAccountCharged.value = await signerSdk.getBalance(gaKeyPair.value.publicKey) > 0 // todo better check
  nonce.value = (await contractInstance.methods.get_nonce()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult

  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  txHash.value = consensus.tx_hash
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by

  hasProposedTx.value = confirmations.value && confirmationsRequired.value
  console.log('signers.value', signers.value)
  console.log('address.value', address.value)

  isCurrentUserSigner.value = signers.value.includes(address.value)
  isConfirmedByCurrentUser.value = confirmedBy.value.includes(address.value)

  proposedAmount.value = offChainTransactionData?.proposedAmount
  recipientAddress.value = offChainTransactionData?.recipientAddress

  if (confirmedBy.value) {
    confirmationsMap.value = await getConfirmationMap(signers.value, confirmedBy.value)
  }
  if (recipientAddress.value && proposedAmount.value) {
    spendTx.value = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  }

  revokedBy.value = offChainTransactionData?.revokedBy
  sentBy.value = offChainTransactionData?.sentBy
}

export const getConfirmationMap = async (signers, confirmedBy) => {
  return await Promise.all(
    signers.map(async signer => {
        return {
          'isConfirmed': confirmedBy.includes(signer),
          'signer': signer,
          'chainName': await resolveChainName(signer),
        }
      },
    ),
  )
}



