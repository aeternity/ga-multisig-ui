import { aeWallet, buildAuthTxHash, getUniversalStamp } from "../utils/aeternity"
import multisigContract from "../utils/aeternity/contracts/SimpleGAMultiSig.aes"
import { MemoryAccount } from '@aeternity/aepp-sdk'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'

export const getSpendTx = async (senderAddress, recipientAddress, proposedAmount) => {
  return await aeWallet.sdk.spendTx({
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  })
}

export const initMultisigContract = async (signers, confirmationsRequired, gaKeyPair) => {

  const contractArgs = [
    confirmationsRequired,
    signers,
  ]

  const signerSdk = await getUniversalStamp()

  const contractInstance = await signerSdk.getContractInstance({ source: multisigContract })
  await contractInstance.compile()

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

  const { rawTx } = await signerSdk.send(attachTX.tx, {
    innerTx: true,
    onAccount: gaKeyPair,
  })

  await aeWallet.sdk.payForTransaction(rawTx)
}

export const proposeTx = async (spendTx, contractId) => {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')
  const spendTxHash = await buildAuthTxHash(encoded)

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

const spendFee = 776440000000000

export const preChargeMultisigAccount = async (gaPublicKey) => {
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
  const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')
  const spendTxHash = await buildAuthTxHash(encoded)

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  const revokeTx = await gaContractRpc.methods.revoke.send(spendTxHash)
  return revokeTx.decodedEvents[0].args[1]
}

