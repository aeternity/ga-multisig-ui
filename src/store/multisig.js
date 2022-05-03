import { Crypto, MemoryAccount, Node, TxBuilderHelper, Universal } from '@aeternity/aepp-sdk'

import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { Buffer } from "buffer"
import { aeWallet } from "../utils/aeternity/wallet"


export const multisig = reactive({
  middleware: [
    {
      signer: 'ak_2QwV57qAR1rPqWfX4smiTXTn6Gp3aRd2q7boGxJy74wEMn85N7',
      multisigContracts: [
        "ak_YQw2oFWR1iS6ao82fjwPg6JnHuRY9Bg67HVFQ9KmNyw2Cw6e6",
        "ak_2Rb9X6kYEV89hpPP5Lw5K9khYc9CeYghMwBKwqWshcwAa3LNjg",
      ],
    },
    {
      signer: 'ak_2JUjxGNfpVCov7SGTZdPGWW5XUZmuPwqbZsD9LaReEceFusbhU',
      multisigContracts: [
        "ak_2oFR9ZLskmqNuGRhdVcThNR94ESUwgJqkNHEJAvmLM1DEd3bKP",
        "ak_TeHTokAWoQgPukRkY7tQEa86jU6DnYjEb5YfwuLMYBLTFBD39",
      ],
    },
  ],
})


export const createGA = async (signer1, signer2, signersAmount) => {
  const { sdk } = toRefs(aeWallet)
  const gaKeypair = Crypto.generateKeyPair()
  const multisigAccount = MemoryAccount({ keypair: gaKeypair })

  // todo get signer instance
  const node = await Node({ url: 'https://net.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'net', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
    accounts: [multisigAccount],
  })

  const contractInstanceInitial = await signerSdk.getContractInstance(
    { source: multisigContract })

  await contractInstanceInitial.compile()

  const multisigArgs = [
    signersAmount, [signer1.publicKey, signer2.publicKey],
  ]

  const attachTX = await signerSdk.gaAttachTx({
    ownerId: gaKeypair.publicKey,
    code: contractInstanceInitial.bytecode,
    callData: contractInstanceInitial.calldata.encode(contractInstanceInitial._name, 'init', multisigArgs),
    authFun: hash('authorize'),
    gas: await contractInstanceInitial._estimateGas('init', multisigArgs),
    options: {
      innerTx: true,
    },
  })

  const { rawTx } = await signerSdk.send(
    attachTX.tx, {
      innerTx: true,
      onAccount: multisigAccount,
    })

  await sdk.value.payForTransaction(rawTx)

  // this.isGa = await signerSdk.isGA(this.gaKeypair.publicKey)
  // todo get contractinstance
  const contractAccount = await signerSdk.getAccount(gaKeypair.publicKey)

  const gaContract = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  const consensusInfo = (await gaContract.methods.get_consensus_info()).decodedResult


  console.log('consensusInfo', consensusInfo)

}

export const proposeTx = async () => {
  const { sdk } = toRefs(aeWallet)

  const Recipient = Crypto.generateKeyPair()


  // PROPOSE

  const SpendTx = await sdk.value.spendTx({
    senderId: gaKeypair.publicKey,
    recipientId: Recipient.publicKey,
    amount: 1000,
  })

  const encoded = encode(unpackTx(SpendTx).rlpEncoded, 'tx')

  const SpendTxHash = await buildAuthTxHash(encoded)

  const expirationHeight = await signerSdk.height() + 50
  console.log('SpendTxHash', SpendTxHash)
  console.log('expirationHeight', expirationHeight)
  const calldata = gaContract.calldata.encode('SimpleGAMultiSig', 'propose', [SpendTxHash, { FixedTTL: [expirationHeight] }])


  const contractCallTx = await signerSdk.contractCallTx({
    callerId: signer1.publicKey,
    contractId: contractAccount.contractId,
    amount: 0,
    gas: 1000000,
    gasPrice: 1500000000,
    callData: calldata,
  })

  const signedContractCallTx = await signerSdk.signTransaction(
    contractCallTx, { onAccount: signer1, innerTx: true },
  )

  await sdk.value.payForTransaction(
    signedContractCallTx,
  )

  const proposedConsensusInfo = (await gaContract.methods.get_consensus_info()).decodedResult
  console.log('proposedConsensusInfo', proposedConsensusInfo)
}


export const confirmTx = async () => {

  const calldata2 = gaContract.calldata.encode('SimpleGAMultiSig', 'confirm', [SpendTxHash])
  const contractCallTx2 = await signerSdk.contractCallTx({
    callerId: signer2.publicKey,
    contractId: contractAccount.contractId,
    amount: 0,
    gas: 1000000,
    gasPrice: 1500000000,
    callData: calldata2,
  })

  const signedContractCallTx2 = await signerSdk.signTransaction(
    contractCallTx2, { onAccount: signer2, innerTx: true },
  )

  await sdk.value.payForTransaction(signedContractCallTx2)

  const confirmedInfo = (await gaContract.methods.get_consensus_info()).decodedResult
  console.log('consensusInfo - After Confirm', confirmedInfo)
}

export const sendTx = async () => {


  // SEND
  const nonce = (await gaContract.methods.get_nonce()).decodedResult

  const balanceBefore = await signerSdk.getBalance(Recipient.publicKey)

  console.log('recipient balanceBefore', balanceBefore)

  // pre charge GA account create gaAccount on chai
  // todo do button workaround in app
  await sdk.value.spend(
    776440000000000,
    gaKeypair.publicKey,
  )

  const gaAccount = MemoryAccount({ keypair: gaKeypair })


  await signerSdk.send(
    SpendTx,
    {
      onAccount: gaAccount,
      authData: { source: multisigContract, args: [nonce] },
    })

  const balanceAfter = await signerSdk.getBalance(Recipient.publicKey)
  console.log('recipient balance After', balanceAfter)

  const consensusInfoAfterSend = (await gaContract.methods.get_consensus_info()).decodedResult
  console.log('consensusInfo - After Send', consensusInfoAfterSend)

  return gaKeypair
}

export const revokeTx = async () => {
  const signer1Account = MemoryAccount({ keypair: this.signer1 })

  const calldata2 = this.contractInstanceInitial.calldata.encode('SimpleGAMultiSig', 'revoke', [this.SpendTxHash])
  const contractCallTx2 = await signerSdk.contractCallTx({
    callerId: this.signer1.publicKey,
    contractId: this.contractAccount.contractId,
    amount: 0,
    gas: 1000000,
    gasPrice: 1500000000,
    callData: calldata2,
  })

  const signedContractCallTx2 = await signerSdk.signTransaction(
    contractCallTx2, { onAccount: signer1Account, innerTx: true },
  )

  await this.payerSdk.payForTransaction(signedContractCallTx2)

  this.revokedInfo = (await this.contractInstanceInitial.methods.get_consensus_info()).decodedResult

}

export const loadContractInfo = async () => {
// todo reuse this
  const signerSdk = await Universal({
    nodes: [{
      name: 'net',
      instance: await Node({ url: 'https://net.aeternity.io' }),
    }],
    compilerUrl: 'https://compiler.aepps.com',
  })

  const contractAccount = await signerSdk.getAccount(this.inputAddress.trim())

  const contractInstanceInitial = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  this.loadedContractInfo = (await contractInstanceInitial.methods.get_consensus_info()).decodedResult
}


export const loadContractDetail = async (contractId) => {
  const node = await Node({ url: 'https://net.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'net', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
  })
  console.log('contractId', contractId)

  const contractAccount = await signerSdk.getAccount(contractId)

  const contractInstanceInitial = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  const loadedContractInfo = (await contractInstanceInitial.methods.get_consensus_info()).decodedResult
  console.log('loadedContractInfo', loadedContractInfo)
  return loadedContractInfo
}

export const loadMyContracts = async () => {
  const { address, middleware } = toRefs(aeWallet)
  const myContracts = middleware.value.find(({ signer }) => signer === address.value)
  console.log('myContracts', myContracts)
  return myContracts.multisigContracts
}

export const buildAuthTxHash = async (rlpTransaction) => {
  const { sdk } = toRefs(aeWallet)
  return new Uint8Array(
    Crypto.hash(Buffer.concat([
        Buffer.from(sdk.value.getNetworkId()),
        TxBuilderHelper.decode(rlpTransaction, 'tx'),
      ]),
    ),
  )
}

