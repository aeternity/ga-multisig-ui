<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="isCurrentUserSigner">
    <h2>Contract Detail</h2>
    <!--    todo merge detail and create-->
    <!--    todo print basic Multisig GA info block-->
    <propose-form
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>
    <confirm-form
      v-if="hasProposedTx"
      :signers="signers"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
      @confirm-clicked="confirmTx"
      @revoke-clicked="revokeTx"/>
    <!--    update state after click confirm-->
    <send-form
      v-if="hasConsensus"
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
  </div>
  <div v-else>
    Sorry you are not on the signer list
  </div>
  <!--  todo add loader-->
</template>

<script setup>
import { aeWallet } from '../utils/aeternity'
import {
  confirmIt,
  getContractByContractId,
  multisig,
  patchProposalByContractId,
  proposeIt,
  revokeIt,
  sendIt,
  updateContractInfo,
} from '../store'
import { MemoryAccount, Node, Universal } from '@aeternity/aepp-sdk'

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { COMPILER_URL } from "../utils/aeternity/configs"
import WalletInfo from "../components/WalletInfo"
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

const signerSdk = ref(null)
const contractAccount = ref(null)
const contractInstance = ref(null)
const spendTx = ref(null)
const proposedAmount = ref(null)
const recipientAddress = ref(null)
const hasProposedTx = ref(null)
const hasConsensus = ref(null)
const gaPubKey = ref(null)
const gaSecret = ref(null)
const txHash = ref(null)
const signers = ref(null)
const confirmations = ref(null)
const confirmedBy = ref(null)
const confirmationsRequired = ref(null)

// todo comment watcher

watch(() => route,
  (value, oldValue) => {
    if (oldValue.id === route.params.id) {
      clearValues()
      // todo fix clearing
    }
  },
)
// todo maybe onBeforeMount

onMounted(async () => {
  const contractId = route.params.id
  const contractDetails = await getContractByContractId(contractId)
  await loadContract(contractDetails.gaAddress, contractDetails.gaSecret)     // todo  can be this done better?


  bindValues()

  signerSdk.value = await Universal({
    nodes: [{
      name: 'testnet',
      instance: await Node({ url: 'https://testnet.aeternity.io' }),
    }],
    compilerUrl: COMPILER_URL,
  })
  contractAccount.value = await signerSdk.value.getAccount(gaPubKey.value)
  contractInstance.value = await signerSdk.value.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.value.contractId,
    },
  )
})

function bindValues () {
  recipientAddress.value = multisig.recipientAddress
  proposedAmount.value = multisig.proposedAmount
  hasProposedTx.value = multisig.hasProposedTx
  hasConsensus.value = multisig.hasConsensus
  gaPubKey.value = multisig.gaPubKey
  gaSecret.value = multisig.gaSecret
  txHash.value = multisig.txHash
  signers.value = multisig.signers
  confirmedBy.value = multisig.confirmedBy
  confirmations.value = multisig.confirmations
  confirmationsRequired.value = multisig.confirmationsRequired
}

function clearValues () {
  // todo move this to store
  recipientAddress.value = null
  proposedAmount.value = null
  hasProposedTx.value = null
  hasConsensus.value = null
  gaPubKey.value = null
  gaSecret.value = null
  txHash.value = null
  signers.value = null
  confirmedBy.value = null
  confirmations.value = null
  confirmationsRequired.value = null
}

const isCurrentUserSigner = computed(() => multisig.isCurrentUserSigner)


async function loadContract (gaAddress, gaSecret) {
  const signerSdk = await Universal({
    nodes: [{
      name: 'testnet',
      instance: await Node({ url: 'https://testnet.aeternity.io' }),
    }],
    compilerUrl: COMPILER_URL,
  })
  await updateContractInfo(signerSdk, gaAddress, gaSecret)
}

async function proposeTx () {
  spendTx.value = await aeWallet.sdk.spendTx({
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value, //todo not connected
    amount: proposedAmount.value, //todo not connected
  })

  await proposeIt(spendTx.value, signerSdk.value, contractAccount.value.contractId)

  // todo signer sdk to store
  await patchProposalByContractId(contractAccount.value.contractId, recipientAddress.value, proposedAmount.value)
  await updateContractInfo(signerSdk.value, gaPubKey.value, gaSecret.value) // todo improve/reduce params
}


async function confirmTx () {
  await confirmIt(contractAccount.value.contractId, signerSdk.value, txHash.value)
  await updateContractInfo(signerSdk.value, gaPubKey.value) // todo improve/reduce params
}

async function sendTx () {
  const gaAccount = MemoryAccount(
    {
      keypair: {
        publicKey: gaPubKey.value,
        secretKey: gaSecret.value,
      },
    },
  )

  const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  console.log('contractInstance', contractInstance)
  await sendIt(contractInstance.value, gaPubKey.value, gaAccount, spendTx, signerSdk.value)

  await updateContractInfo(signerSdk.value, gaPubKey.value, gaSecret.value) // todo improve/reduce params
}


async function revokeTx () {
  const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  // todo is account necessary?

  await revokeIt(spendTx, contractAccount.value.contractId, signerSdk.value, gaPubKey.value, gaSecret.value)

  await updateContractInfo(signerSdk.value, gaPubKey.value, gaSecret.value) // todo improve/reduce params
}
</script>
