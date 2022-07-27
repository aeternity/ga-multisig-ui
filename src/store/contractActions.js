import { Buffer } from "buffer";
import { wallet,  getUniversalStamp } from "@/utils/aeternity"
import { MemoryAccount, buildAuthTxHash } from '@aeternity/aepp-sdk'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'

export async function getSpendTx (senderAddress, recipientAddress, proposedAmount) {
  return await wallet.sdk.spendTx({
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  })
}

export async function proposeTx (spendTx, contractId) {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const spendTxHash = await buildAuthTxHash(spendTx)

  const gaContractRpc = await wallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
  return Buffer.from(spendTxHash).toString('hex');
}

export async function confirmTx (contractId, spendTxHash) {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const gaContractRpc = await wallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export async function sendTx (accountId, spendTx, nonce) {
  const signerSdk = await getUniversalStamp()
  await signerSdk.addAccount(MemoryAccount({ gaId: accountId }), { select: true })
  await signerSdk.send(
    spendTx,
    {
      authData: { source: multisigContract, args: [nonce] },
    })
}

export async function revokeTx (spendTxHash, contractId) {
  const gaContractRpc = await wallet.sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.revoke.send(Uint8Array.from(Buffer.from(spendTxHash, 'hex')))
}

