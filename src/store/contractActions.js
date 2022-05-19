import { aeWallet, buildAuthTxHash } from "../utils/aeternity"
import multisigContract from "../utils/aeternity/contracts/SimpleGAMultiSig.aes"
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { MemoryAccount } from '@aeternity/aepp-sdk'
import { getUniversalStamp } from "./multisig"


export const proposeIt = async (spendTx, signerSdk, contractId) => {
  const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')

  const spendTxHash = await buildAuthTxHash(encoded)
  const expirationHeight = await signerSdk.height() + 50
  const gaContractRpc = await aeWallet.sdk.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractId,
    },
  )

  await gaContractRpc.methods.propose.send(spendTxHash, { FixedTTL: [expirationHeight] })
}

export const confirmIt = async (contractId, spendTxHash) => {
  const signerSdk = await getUniversalStamp()
  const gaContractRpc = await aeWallet.sdk.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractId,
    },
  )
  const expirationHeight = await signerSdk.height() + 50

  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })

}

export const sendIt = async (contractInstance, gaPubkey, gaSecret, spendTx) => {
  const signerSdk = await getUniversalStamp()

  const nonce = (await contractInstance.methods.get_nonce()).decodedResult


  // todo try wrapping it in a PayingForTx?
  //  The issue is the Account the generalized Account is created from (creation is conversion) has to pay for the costs.
  //  Maybe this can be solved using PayingForTx, so someone else pay the fee.
  //  If that approach works we can integrate it into the sdk.

  await aeWallet.sdk.spend(
    776440000000000,
    gaPubkey,
    // todo do button workaround  pre charge GA account create this.gaAccount on chai
  )
  const keypair = {
    publicKey: gaPubkey,
    secretKey: gaSecret,
  }
  const gaAccount = MemoryAccount({ keypair: keypair })
  await signerSdk.send(
    spendTx,
    {
      onAccount: gaAccount,
      authData: { source: multisigContract, args: [nonce] },
    })
}

export const revokeIt = async (spendTx, contractId) => {
  const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')
  const spendTxHash = await buildAuthTxHash(encoded)

  const gaContractRpc = await aeWallet.sdk.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractId,
    },
  )
  const revokeTx = await gaContractRpc.methods.revoke.send(spendTxHash)
  console.log('revokeTx.decodedEvents', revokeTx.decodedEvents[0].args[1])

  // todo improve/reduce params
  // todo show link to successful transaction just for show
}

