import { Node, Universal } from '@aeternity/aepp-sdk'
import { reactive, toRefs } from 'vue'
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { aeWallet, buildAuthTxHash } from "../utils/aeternity"
import { getContractByGaAddress } from "./off-chainDB"
import { unpackTx } from '@aeternity/aepp-sdk/es/tx/builder'
import { encode } from '@aeternity/aepp-sdk/es/utils/encoder'

export const multisig = reactive({
  version: null,
  confirmations: null,
  signers: null,
  confirmationsRequired: null,
  hasProposedTx: null,
  hasConsensus: null,
  isCurrentUserSigner: null,
  multisigContracts: null,
  txHash: null,
  proposedAmount: null,
  recipientAddress: null,
  gaPubKey: null,
  gaSecret: null,
  confirmedBy: null
})

export const updateContractInfo = async (universal, gaAddress, gaSecretKey) => {
  const {
    // todo is this boilerplate neccessary?
    version,
    confirmations,
    confirmationsRequired,
    signers,
    hasProposedTx,
    hasConsensus,
    isCurrentUserSigner,
    txHash,
    proposedAmount,
    recipientAddress,
    gaPubKey,
    gaSecret, //todo rename
    confirmedBy,
  } = toRefs(multisig)
  const { address } = toRefs(aeWallet)

  const contractAccount = await universal.getAccount(gaAddress)
  // todo fix je vubec potreba contractaddress ?
  // todo nejde to udelat rovnou s  contractId namisto gaaddress?

  const contractInstance = await universal.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.contractId,
    },
  )
  gaPubKey.value = gaAddress // todo better naming
  gaSecret.value = gaSecretKey // todo better naming
  // confirmations.value = (await contractInstance.methods.get_consensus_info()).decodedResult
  signers.value = (await contractInstance.methods.get_signers()).decodedResult
  version.value = (await contractInstance.methods.get_version()).decodedResult

  const consensus = (await contractInstance.methods.get_consensus_info()).decodedResult
  confirmations.value = consensus.confirmed_by.length
  confirmationsRequired.value = Number(consensus.confirmations_required)

  txHash.value = consensus.tx_hash


  isCurrentUserSigner.value = signers.value.includes(address.value)
  hasProposedTx.value = !!confirmations.value
  hasConsensus.value = consensus.has_consensus
  confirmedBy.value = consensus.confirmed_by


  if (hasProposedTx.value) {
    const offChainProposeData = getContractByGaAddress(gaAddress)
    proposedAmount.value = offChainProposeData.proposedAmount
    recipientAddress.value = offChainProposeData.recipientAddress
  }
}

export const loadMyContracts = async () => {
  const { address } = toRefs(aeWallet)
  const { multisigContracts } = toRefs(multisig)


  const myContracts = multisigContracts.value.filter(contract => {
    return contract.signers.includes(address.value)
  })
  return myContracts
}

export const getUniversalInstance = async () => {
  // todo node from variable
  const node = await Node({ url: 'https://net.aeternity.io' })

  const signerSdk = await Universal({
    nodes: [{ name: 'testnet', instance: node }],
    compilerUrl: 'https://compiler.aepps.com',
  })
  return signerSdk
}

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

export const confirmIt = async(contractId, signerSdk, spendTxHash) => {
  const gaContractRpc = await aeWallet.sdk.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractId,
    },
  )
  const expirationHeight = await signerSdk.height() + 50

  await gaContractRpc.methods.confirm.send(spendTxHash, { FixedTTL: [expirationHeight] })

}

export const sendIt = async (contractInstance, publicKey, gaAccount, spendTx, signerSdk) => {
  const nonce = (await contractInstance.methods.get_nonce()).decodedResult



  // todo try wrapping it in a PayingForTx?
  //  The issue is the Account the generalized Account is created from (creation is conversion) has to pay for the costs.
  //  Maybe this can be solved using PayingForTx, so someone else pay the fee.
  //  If that approach works we can integrate it into the sdk.

  await aeWallet.sdk.spend(
    776440000000000,
   publicKey,
    // todo do button workaround  pre charge GA account create this.gaAccount on chai
  )

  await signerSdk.send(
    spendTx,
    {
      onAccount: gaAccount,
      authData: { source: multisigContract, args: [nonce] },
    })
}

export const revokeIt = async (spendTx, contractId, signerSdk, publicKey, secretKey) => {
    const encoded = encode(unpackTx(spendTx).rlpEncoded, 'tx')
    const spendTxHash = await buildAuthTxHash(encoded)

    const gaContractRpc = await aeWallet.sdk.getContractInstance(
      {
        source: multisigContract,
        contractAddress: contractId,
      },
    )
    await gaContractRpc.methods.revoke.send(spendTxHash)

    await updateContractInfo(signerSdk, publicKey, secretKey) // todo improve/reduce params
    // todo show link to successful transaction just for show
}


