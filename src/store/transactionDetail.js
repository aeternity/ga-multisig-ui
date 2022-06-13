import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet, getUniversalStamp } from "../utils/aeternity"
import { getTransactionByContractId } from "./app"
import { getSpendTx } from "./contractActions"
import { resolveChainName } from "./chainNames"

const getInitialTransactionDetail = () => ({
  gaKeyPair: null,
  isMultisigAccountCharged: false,
  contractId: null,
  contractAccount: null,
  contractInstance: null,

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
  version: null,
  nonce: null,
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
    contractAccount,
    contractInstance,
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
    version,
    nonce,
  } = toRefs(transactionDetail)

  const signerSdk = await getUniversalStamp()
  const { address } = toRefs(aeWallet)
  contractAccount.value = await signerSdk.getAccount(gaKeyPair.value.publicKey)

  contractId.value = contractAccount.value.contractId

  const offChainContractData = getTransactionByContractId(contractId.value)


  contractInstance.value = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId.value,
  })

  isMultisigAccountCharged.value = await signerSdk.getBalance(gaKeyPair.value.publicKey) > 0 // todo better check
  nonce.value = (await contractInstance.value.methods.get_nonce()).decodedResult
  signers.value = (await contractInstance.value.methods.get_signers()).decodedResult
  version.value = (await contractInstance.value.methods.get_version()).decodedResult
  const consensus = (await contractInstance.value.methods.get_consensus_info()).decodedResult

  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  txHash.value = consensus.tx_hash
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by

  hasProposedTx.value = confirmations.value && confirmationsRequired.value
  isCurrentUserSigner.value = signers.value.includes(address.value)
  isConfirmedByCurrentUser.value = confirmedBy.value.includes(address.value)

  proposedAmount.value = offChainContractData?.proposedAmount
  recipientAddress.value = offChainContractData?.recipientAddress

  if (confirmedBy.value) {
    confirmationsMap.value = await getConfirmationMap(signers.value, confirmedBy.value)
  }
  if (recipientAddress.value && proposedAmount.value) {
    spendTx.value = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  }

  revokedBy.value = offChainContractData?.revokedBy
  sentBy.value = offChainContractData?.sentBy
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



