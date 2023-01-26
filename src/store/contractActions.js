import { Buffer } from "buffer";
import { sdk, getUniversalStamp } from "@/utils/aeternity";
import { MemoryAccount, Tag } from "@aeternity/aepp-sdk";
import multisigContract from "ga-multisig-contract/SimpleGAMultiSig.aes";

export async function getSpendTx(
  senderAddress,
  recipientAddress,
  proposedAmount
) {
  return await sdk.buildTx(Tag.SpendTx, {
    senderId: senderAddress,
    recipientId: recipientAddress,
    amount: proposedAmount,
  });
}

export async function proposeTx(networkId, spendTx, contractId) {
  const signerSdk = await getUniversalStamp(networkId);
  const expirationHeight = (await signerSdk.height()) + 50;
  const spendTxHash = await signerSdk.buildAuthTxHash(spendTx);

  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  });

  await gaContractRpc.methods.propose.send(spendTxHash, {
    FixedTTL: [expirationHeight],
  });
  return Buffer.from(spendTxHash).toString("hex");
}

export async function confirmTx(networkId, contractId, spendTxHash) {
  const signerSdk = await getUniversalStamp(networkId);
  const expirationHeight = (await signerSdk.height()) + 50;

  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  });

  await gaContractRpc.methods.confirm.send(spendTxHash, {
    FixedTTL: [expirationHeight],
  });
}

export async function sendTx(networkId, accountId, spendTx, nonce) {
  const signerSdk = await getUniversalStamp(networkId);
  await signerSdk.addAccount(new MemoryAccount({ gaId: accountId }), {
    select: true,
  });
  await signerSdk.send(spendTx, {
    authData: { source: multisigContract, args: [nonce] },
  });
}

export async function revokeTx(spendTxHash, contractId) {
  const gaContractRpc = await sdk.getContractInstance({
    source: multisigContract,
    contractAddress: contractId,
  });

  await gaContractRpc.methods.revoke.send(
    Uint8Array.from(Buffer.from(spendTxHash, "hex"))
  );
}
