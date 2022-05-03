import {
  RpcAepp,
  Node,
  BrowserWindowMessageConnection,
  WalletDetector,
  AmountFormatter,
  Universal,
  MemoryAccount,
  Crypto,
} from '@aeternity/aepp-sdk'

import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'
import { Buffer } from "buffer"
import { aeWallet } from "../utils/aeternity/wallet"
import {
  TxBuilderHelper,
} from '@aeternity/aepp-sdk'


export const multisig = reactive({
  sdk: null,
  activeWallet: null,
  address: null,
  balance: null,
  walletStatus: null,
  isStatic: false,
  isGa: false,
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

export const loadContractDetail = async (contractId) => {
  const node = await Node({ url: 'https://testnet.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'testnet', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
  })
  console.log('contractId', contractId)

  const contractAccount = await signerSdk.getAccount(contractId)

  const contractInstance = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  const loadedContractInfo = (await contractInstance.methods.get_consensus_info()).decodedResult
  console.log('loadedContractInfo', loadedContractInfo)
  return loadedContractInfo
}

export const loadMyContracts = async () => {
  const { address, middleware } = toRefs(aeWallet)
  const myContracts = middleware.value.find(({ signer }) => signer === address.value)
  console.log('myContracts', myContracts)
  return myContracts.multisigContracts
}

export const createGA = async () => {

}

export const createGAFlow = async () => {
  const { sdk } = toRefs(aeWallet)

  const gaKeypair = Crypto.generateKeyPair()
  const multisigAccount = MemoryAccount({ keypair: gaKeypair })

  const node = await Node({ url: 'https://testnet.aeternity.io' })
  const signerSdk = await Universal({
    nodes: [{ name: 'testnet', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
    accounts: [multisigAccount],
  })

  const contractInstance = await signerSdk.getContractInstance(
    { source: multisigContract })

  const signer1 = Crypto.generateKeyPair()
  const signer2 = Crypto.generateKeyPair()
  const testRecipient = Crypto.generateKeyPair()

  await contractInstance.compile()

  const multisigArgs = [
    2, [signer1.publicKey, signer2.publicKey],
  ]

  const attachTX = await signerSdk.gaAttachTx({
    ownerId: gaKeypair.publicKey,
    code: contractInstance.bytecode,
    callData: contractInstance.calldata.encode(contractInstance._name, 'init', multisigArgs),
    authFun: hash('authorize'),
    gas: await contractInstance._estimateGas('init', multisigArgs),
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
  const contractAccount = await signerSdk.getAccount(gaKeypair.publicKey)

  const gaContract = await signerSdk.getContractInstance(
    { source: multisigContract, contractAddress: contractAccount.contractId },
  )

  const consensusInfo = (await gaContract.methods.get_consensus_info()).decodedResult


  console.log('consensusInfo', consensusInfo)

  // PROPOSE

  const testSpendTx = await sdk.value.spendTx({
    senderId: gaKeypair.publicKey,
    recipientId: testRecipient.publicKey,
    amount: 1000,
  })

  const encoded = encode(unpackTx(testSpendTx).rlpEncoded, 'tx')

  const testSpendTxHash = await buildAuthTxHash(encoded)

  const expirationHeight = await signerSdk.height() + 50
  console.log('testSpendTxHash', testSpendTxHash)
  console.log('expirationHeight', expirationHeight)
  const calldata = gaContract.calldata.encode('SimpleGAMultiSig', 'propose', [testSpendTxHash, { FixedTTL: [expirationHeight] }])


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

  // CONFIRM

  const calldata2 = gaContract.calldata.encode('SimpleGAMultiSig', 'confirm', [testSpendTxHash])
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


  // SEND
  const nonce = (await gaContract.methods.get_nonce()).decodedResult

  const balanceBefore = await signerSdk.getBalance(testRecipient.publicKey)

  console.log('recipient balanceBefore', balanceBefore)

  // pre charge GA account create gaAccount on chai
  // todo do button workaround in app
  await sdk.value.spend(
    776440000000000,
    gaKeypair.publicKey,
  )

  const gaAccount = MemoryAccount({ keypair: gaKeypair })


  await signerSdk.send(
    testSpendTx,
    {
      onAccount: gaAccount,
      authData: { source: multisigContract, args: [nonce] },
    })

  const balanceAfter = await signerSdk.getBalance(testRecipient.publicKey)
  console.log('recipient balance After', balanceAfter)

  const consensusInfoAfterSend = (await gaContract.methods.get_consensus_info()).decodedResult
  console.log('consensusInfo - After Send', consensusInfoAfterSend)

  return gaKeypair
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

export const aeFetchWalletInfo = async (sdk) => {
  const { address, balance, walletStatus, isGa } = toRefs(aeWallet)

  walletStatus.value = 'fetching_info'

  try {
    address.value = await sdk.address()

    balance.value = await sdk.getBalance(address.value, {
      format: AmountFormatter.AE_AMOUNT_FORMATS.AE,
    })

    const node = await Node({ url: 'https://testnet.aeternity.io' })

    const universal = await Universal({
      nodes: [{ name: 'testnet', instance: node }],
      compilerUrl: 'https://compiler.aepps.com',
    })

    isGa.value = await universal.isGA(address.value)


    walletStatus.value = null
    return true
  } catch (error) {
    walletStatus.value = 'fetching_failed'
    console.info('aeFetchWalletInfo error::', error)
    return false
  }
}
