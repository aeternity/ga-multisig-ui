import { aeWallet, buildAuthTxHash, getUniversalStamp } from "../utils/aeternity"
import { MemoryAccount } from '@aeternity/aepp-sdk'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'
import { reactive } from "vue"


export const creationSteps = reactive({
  creationStep1: false,
  creationStep2: false,
  creationStep3: false,
  creationStep4: false,
  creationStep5: false,
})


export const getSpendTx = async (senderAddress, recipientAddress, proposedAmount) => {
  return await aeWallet.sdk.spendTx({
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  })
}


export const proposeTx = async (spendTx, contractId) => {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const spendTxHash = await buildAuthTxHash(spendTx)

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export const preChargeMultisigAccount = async (gaPublicKey) => {
  const spendFee = 776440000000000
  await aeWallet.sdk.spend(
    spendFee,
    gaPublicKey,
  )
}

export const confirmTx = async (contractId, spendTxHash) => {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export const sendTx = async (gaKeyPair, spendTx, contractInstance) => {
  const signerSdk = await getUniversalStamp()

  const nonce = (await contractInstance.methods.get_nonce()).decodedResult

  await signerSdk.send(
    spendTx,
    {
      onAccount: MemoryAccount({ keypair: gaKeyPair }),
      authData: { source: multisigContract, args: [nonce] },
    })
}

export const revokeTx = async (spendTx, contractId) => {
  const spendTxHash = await buildAuthTxHash(spendTx)

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  const revokeTx = await gaContractRpc.methods.revoke.send(spendTxHash)
  return revokeTx.decodedEvents[0].args[1]
}

