import { reactive, toRefs } from 'vue'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'
import { aeWallet, getUniversalStamp } from "../utils/aeternity"
import { creationSteps } from "./contractActions"
// import { getSafeByAddress } from "./app"
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { getSafeByContractId, getTransactionBySafe } from "./app"


const getInitialSafeDetail = () => ({
  safeKeyPair: null,
  isMultisigAccountCharged: false,
  safeId: null,
  nonce: null,
  version: null,
  transactions: null,
  balance: null,
})

export const safeDetail = reactive(getInitialSafeDetail())

export const clearSafeDetail = () => {
  Object.assign(safeDetail, getInitialSafeDetail())
}

export const initSafe = async (signers, confirmationsRequired, safeKeyPair) => {
  const { creationStep1, creationStep2, creationStep3, creationStep4 } = toRefs(creationSteps)
  const { safeId, nonce, version } = toRefs(safeDetail)

  const contractArgs = [
    confirmationsRequired,
    signers,
  ]
  const signerSdk = await getUniversalStamp()

  const contractInstance = await signerSdk.getContractInstance({ source: multisigContract })
  creationStep1.value = true

  await contractInstance.compile()
  creationStep2.value = true

  const attachTX = await signerSdk.gaAttachTx({
    ownerId: safeKeyPair.publicKey,
    code: contractInstance.bytecode,
    callData: contractInstance.calldata.encode(contractInstance._name, 'init', contractArgs),
    authFun: hash('authorize'),
    gas: await contractInstance._estimateGas('init', contractArgs),
    options: {
      innerTx: true,
    },
  })
  creationStep3.value = true

  const { rawTx } = await signerSdk.send(attachTX.tx, {
    innerTx: true,
    onAccount: safeKeyPair,
  })

  await aeWallet.sdk.payForTransaction(rawTx)

  creationStep4.value = true

  const contractAccount = await signerSdk.getAccount(safeKeyPair.publicKey)
  safeId.value = contractAccount.contractId
  return safeId.value
}


export const loadSafeDetail = async (contractId) => {
  // todo param or current
  const {
    safeKeyPair,
    safeId,
    version,
    nonce,
    transactions,
    balance,
  } = toRefs(safeDetail)

  const signerSdk = await getUniversalStamp()
  const safeData = getSafeByContractId(contractId)
  safeKeyPair.value = safeData.safeKeyPair
  balance.value = await signerSdk.balance(safeKeyPair.value.publicKey)


  safeId.value = safeData.contractId

  const safeInstance = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: safeId.value,
  })


  // isMultisigAccountCharged.value = await signerSdk.getBalance(safeData.safeKeyPair.publicKey) > 0
  nonce.value = (await safeInstance.methods.get_nonce()).decodedResult
  version.value = (await safeInstance.methods.get_version()).decodedResult

  transactions.value = getTransactionBySafe(safeId.value)
}

