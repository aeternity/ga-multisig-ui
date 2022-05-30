import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet, getUniversalStamp } from "../utils/aeternity"
import { getContractByAddress } from "./app"
import { getSpendTx } from "./contractActions"
import axios from "axios"

const getInitialContractDetail = () => ({
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
  chainNames: [],
})

export const contractDetail = reactive(getInitialContractDetail())

export const clearContractDetail = () => {
  Object.assign(contractDetail, getInitialContractDetail())
}

export const loadContractDetail = async () => {
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
    chianNames,
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

  isMultisigAccountCharged.value = await signerSdk.getBalance(gaKeyPair.value.publicKey) > 0
  nonce.value = (await contractInstance.value.methods.get_nonce()).decodedResult
  signers.value = (await contractInstance.value.methods.get_signers()).decodedResult
  version.value = (await contractInstance.value.methods.get_version()).decodedResult
  const consensus = (await contractInstance.value.methods.get_consensus_info()).decodedResult

  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  txHash.value = consensus.tx_hash
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by

  const names = await getNames()
  chianNames.value = names

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

export const getConfirmationMap = (signers, confirmedBy) => {
  return signers.map(signer => {
      return {
        'isConfirmed': confirmedBy.includes(signer),
        'signer': signer,
        'chainName': getChainNameByAddress(signer),
      }
    },
  )
}

export const getNames = async (cursor) => {
  const { chainNames } = toRefs(contractDetail)

  const address = cursor || '/v2/names?limit=10'
  try {
    const { data } = await fetchNames(address)
    chainNames.value = [...chainNames.value, ...data.data]
    await getNames(data.next)
  } catch (e) {
    console.log(e)
  }
}

export const getChainNameByAddress = (address) => {
  const { chainNames } = toRefs(contractDetail)
  return chainNames.value.find(name => name.info.ownership.current === address).name
}

export const fetchNames = async (address) => {
  const url = 'https://testnet.aeternity.io/mdw'
  return await axios.get(url + address)
}




