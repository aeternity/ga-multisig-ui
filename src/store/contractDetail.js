import { Buffer } from "buffer";
import multisigContract from 'ga-multisig-contract/contracts/SimpleGAMultiSig.aes'
import { reactive, toRefs } from 'vue'
import { aeWallet, getUniversalStamp } from "@/utils/aeternity"
import { getGaAccountIdByContractId } from "./app"
import { getSpendTx } from "./contractActions"
import { resolveChainName } from "./chainNames"
import { creationPhases } from "./safeCreation"
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { Crypto } from '@aeternity/aepp-sdk'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { getTransactionByHash } from "@/store/backend";

const getInitialContractDetail = () => ({
  accountId: null,
  createdAccount: null,
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
  proposedFee: null,
  recipientAddress: null,
  confirmations: null,
  confirmationsRequired: null,
  confirmationsMap: null,
  confirmedBy: null,
  spendTx: null,
  txHash: null,
  balance: null,
  version: null,
  nonce: null,
})

export const contractDetail = reactive(getInitialContractDetail())

export const clearContractDetail = () => {
  Object.assign(contractDetail, getInitialContractDetail())
}

export async function initSafe (signers, confirmationsRequired) {
  const {
    createdAccount,
  } = toRefs(contractDetail)
  createdAccount.value = Crypto.generateKeyPair()
  const { creationPhase1, creationPhase2, creationPhase3, creationPhase4 } = toRefs(creationPhases)
  const { sdk } = toRefs(aeWallet)

  const contractArgs = [
    confirmationsRequired,
    signers,
  ]

  const signerSdk = await getUniversalStamp()

  const contractInstance = await signerSdk.getContractInstance({ source: multisigContract })
  creationPhase1.value = true

  await contractInstance.compile()
  creationPhase2.value = true

  const attachTX = await signerSdk.gaAttachTx({
    ownerId: createdAccount.value.publicKey,
    code: contractInstance.bytecode,
    callData: contractInstance.calldata.encode(contractInstance._name, 'init', contractArgs),
    authFun: hash('authorize'),
    gas: await contractInstance._estimateGas('init', contractArgs),
    options: {
      innerTx: true,
    },
  })
  creationPhase3.value = true
  const { rawTx } = await signerSdk.send(attachTX.tx, {
    innerTx: true,
    onAccount: createdAccount.value,
  })

  await sdk.value.payForTransaction(rawTx)
  creationPhase4.value = true

  const contractAccount = await signerSdk.getAccount(createdAccount.value.publicKey)

  return { contractId: contractAccount.contractId, gaAccountId: createdAccount.value.publicKey }
}

export async function loadContractDetail (cid) {
  const {
    accountId,
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
    proposedFee,
    recipientAddress,
    confirmations,
    confirmationsRequired,
    confirmationsMap,
    confirmedBy,
    spendTx,
    txHash,
    nonce,
    balance,
    version,
  } = toRefs(contractDetail)
  const { address, sdk } = toRefs(aeWallet)
  contractId.value = cid

  accountId.value = getGaAccountIdByContractId(contractId.value)

  const contractInstance = await sdk.value.getContractInstance({
    source: multisigContract,
    contractAddress: contractId.value,
  })

  balance.value = await sdk.value.getBalance(accountId.value)
  isMultisigAccountCharged.value = balance.value > 0
  nonce.value = (await contractInstance.methods.get_nonce()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult


  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  txHash.value = consensus.tx_hash ? Buffer.from(consensus.tx_hash).toString('hex') : null
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by

  hasProposedTx.value = confirmations.value && confirmationsRequired.value

  isCurrentUserSigner.value = signers.value.includes(address.value)
  isConfirmedByCurrentUser.value = confirmedBy.value.includes(address.value)

  spendTx.value = txHash.value ? await getTransactionByHash(txHash.value).then(({data}) => data) : null;
  const offChainTransactionData = spendTx.value ? unpackTx(spendTx.value) : null

  proposedAmount.value = offChainTransactionData?.tx?.amount
  proposedFee.value = offChainTransactionData?.tx?.fee
  recipientAddress.value = offChainTransactionData?.tx?.recipientId

  if (confirmedBy.value) {
    confirmationsMap.value = await getConfirmationMap(signers.value, confirmedBy.value)
  }

  revokedBy.value = offChainTransactionData?.revokedBy
  sentBy.value = offChainTransactionData?.sentBy
}

export async function getConfirmationMap (signers, confirmedBy) {
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



