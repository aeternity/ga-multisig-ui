import { Buffer } from "buffer";
import { sdk, getUniversalStamp } from "@/utils/aeternity"
import { MemoryAccount, buildAuthTxHash, Tag, Node } from '@aeternity/aepp-sdk'
import multisigContract from 'ga-multisig-contract/SimpleGAMultiSig.aes'

export async function getSpendTx (senderAddress, recipientAddress, proposedAmount) {
  return await sdk.buildTx(Tag.SpendTx, {
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  })
}

export async function proposeTx (spendTx, contractId) {
  const signerSdk = await getUniversalStamp()
  console.log('signerSdk', signerSdk)
  const expirationHeight = await signerSdk.height() + 50
  console.log('signerSdk.selectedNodeName', signerSdk.selectedNodeName)
  const spendTxHash = await signerSdk.buildAuthTxHash(spendTx)
  console.log('spendTxHash', spendTxHash)

  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })
  console.log('gaContractRpc', gaContractRpc)
  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
  return Buffer.from(spendTxHash).toString('hex');
}

export async function confirmTx (contractId, spendTxHash) {
  const signerSdk = await getUniversalStamp()
  const expirationHeight = await signerSdk.height() + 50

  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })
  console.log('confirmTx gaContractRpc', gaContractRpc)
  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export async function sendTx (accountId, spendTx, nonce) {
  const signerSdk = await getUniversalStamp()
  await signerSdk.addAccount(new MemoryAccount({ gaId: accountId }), { select: true })
  await signerSdk.send(
    spendTx,
    {
      authData: { source: multisigContract, args: [nonce] },
    })
}

export async function revokeTx (spendTxHash, contractId) {
  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  })

  await gaContractRpc.methods.revoke.send(Uint8Array.from(Buffer.from(spendTxHash, 'hex')))
}

