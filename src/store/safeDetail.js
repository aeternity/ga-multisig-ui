import { reactive, toRefs } from 'vue'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'
import { aeWallet, getUniversalStamp } from "../utils/aeternity"
import { creationSteps } from "./contractActions"
// import { getSafeByAddress } from "./app"
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { getSafeByContractId, getTransactionBySafe } from "./app"


const getInitialSafeDetail = () => ({
  gaKeyPair: null,
  isMultisigAccountCharged: false,
  safeId: null,
  safeAccount: null, // todo can be local?
  safeInstance: null,// can be local?
  nonce: null,
  version: null,
  transactions: null,
  balance: null,
})

export const safeDetail = reactive(getInitialSafeDetail())

export const clearSafeDetail = () => {
  Object.assign(safeDetail, getInitialSafeDetail())
}

export const initSafe = async (signers, confirmationsRequired, gaKeyPair) => {
  const { creationStep1, creationStep2, creationStep3, creationStep4, creationStep5 } = toRefs(creationSteps)
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
    ownerId: gaKeyPair.publicKey,
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
    onAccount: gaKeyPair,
  })

  await aeWallet.sdk.payForTransaction(rawTx)


  creationStep4.value = true


  const contractAccount = await signerSdk.getAccount(gaKeyPair.publicKey)
  safeId.value = contractAccount.contractId
  return safeId.value
}


export const loadSafeDetail = async (contractId) => {
  // todo param or current
  const {
    gaKeyPair,
    isMultisigAccountCharged,
    safeId,
    safeAccount,
    safeInstance,
    version,
    nonce,
    transactions,
    balance,
  } = toRefs(safeDetail)

  const signerSdk = await getUniversalStamp()
  const { address } = toRefs(aeWallet)
  // const offChainSafeData = getSafeByAddress(gaKeyPair.value.publicKey)
  const safeData = getSafeByContractId(contractId)
  gaKeyPair.value = safeData.gaKeyPair
  balance.value = await signerSdk.balance(gaKeyPair.value.publicKey)

  // safeAccount.value = await signerSdk.getAccount(gaKeyPair.value)

  safeId.value = safeData.contractId
  safeInstance.value = await signerSdk.getContractInstance({
    source: multisigContract,
    contractAddress: safeId.value,
  })


  // await safeInstance.value.deploy()
  // await safeInstance.value.compile()

  // isMultisigAccountCharged.value = await signerSdk.getBalance(safeData.gaKeyPair.publicKey) > 0
  nonce.value = (await safeInstance.value.methods.get_nonce()).decodedResult
  version.value = (await safeInstance.value.methods.get_version()).decodedResult

  transactions.value = getTransactionBySafe(safeId.value)
}


