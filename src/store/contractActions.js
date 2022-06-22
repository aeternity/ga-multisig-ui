import { aeWallet, buildAuthTxHash, getUniversalStamp } from "../utils/aeternity"
import { MemoryAccount } from '@aeternity/aepp-sdk'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'

export async function getSpendTx (senderAddress, recipientAddress, proposedAmount) {
  return await aeWallet.sdk.spendTx({
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  })
}

export async function proposeTx (spendTx, contractId) {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const spendTxHash = await buildAuthTxHash(spendTx)

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export async function confirmTx (contractId, spendTxHash) {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export async function sendTx (gaKeyPair, spendTx, nonce) {
  const signerSdk = await getUniversalStamp()
  await signerSdk.send(
    spendTx,
    {
      onAccount: MemoryAccount({ keypair: gaKeyPair }),
      authData: { source: multisigContract, args: [nonce] },
    })
}

export async function revokeTx (spendTx, contractId) {
  const spendTxHash = await buildAuthTxHash(spendTx)
  const gaContractRpc = await aeWallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  const revokeTx = await gaContractRpc.methods.revoke.send(spendTxHash)
  return revokeTx.decodedEvents[0].args[1]
}

