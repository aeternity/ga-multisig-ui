import { Crypto, MemoryAccount, Node, TxBuilderHelper, Universal } from '@aeternity/aepp-sdk'

import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { hash } from '@aeternity/aepp-sdk/es/utils/crypto'
import { Buffer } from "buffer"
import { aeWallet } from "../utils/aeternity/wallet"


export const multisig = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
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


export const updateContractInfo = async (universal, publicKey) => {
  console.log('update')
  const { version, confirmations, confirmationsRequired, signers } = toRefs(multisig)

  const contractAccount = await universal.getAccount(publicKey)
  // todo fix je vubec potreba contractaddress ?

  const contractInstance = await universal.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.contractId
    },
  )
  // confirmations.value = (await contractInstance.methods.get_consensus_info()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult
  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  console.log('consensus', consensus)
  console.log('consensus.value', consensus.value)
  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)
  // confirmationsRequired.value = Number(await contractInstance.methods.get_consensus_info().confirmations_required).decodedResult

  console.log('version.value', version.value)
  // console.log('STORE consensusInfo', consensusInfo)
  // const contract = await aeWallet.contracts.getContract(multisigContract.id)
  // multisig.version = contract.version
  // multisig.confirmations = contract.confirmations
}

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

