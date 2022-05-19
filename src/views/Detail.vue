<template>
  <WalletInfo class="wallet-info"/>
  <div class="detail" v-if="gaPubKey">
    <h2>Multisig Detail</h2>
    <!--    todo merge detail and create-->

    <signer-list :contract-id="contractId" :ga-pub-key="gaPubKey" :version="version"/>

    <confirmation-list
      :class="[{'disabled': signers && !confirmedBy}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmed-by="confirmedBy"
      :signers="signers"/>

    <propose-form
      v-if="!hasProposedTx"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="proposeTx"/>

    <propose-list v-else :proposed-amount="proposedAmount" :recipientAddress="recipientAddress"/>


    <confirm-form
      v-if="!hasConsensus"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
      @confirm-clicked="confirmTx"
      @revoke-clicked="revokeTx"/>
    <send-form
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      @send-clicked="sendTx"
      @revoke-clicked="revokeTx"/>
    <div v-if="isRevoked">The transaction has been revoked by user ...</div>
    <div v-if="isSent">The transaction has been sent by user...</div>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import { aeWallet } from '../utils/aeternity'
import {
  clearState,
  confirmIt,
  contractDetail,
  getContractByContractId,
  getUniversalStamp,
  hydrateApp,
  patchProposalByContractId,
  patchRevokedStatus,
  patchSentStatus,
  proposeIt,
  revokeIt,
  sendIt,
  updateContractInfo,
} from '../store'

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import ConfirmationList from "../components/ConfirmationList"

import multisigContract from '../utils/aeternity/contracts/SimpleGAMultiSig.aes'
import { onMounted, ref, toRefs } from "vue"
import { useRoute } from "vue-router"
import LoaderImage from "../components/LoaderImage"
import ProposeList from "./ProposeList"
import SignerList from "./SignerList"
import WalletInfo from "../components/WalletInfo"


const {
  version,
  confirmations,
  confirmationsRequired,
  signers,
  hasConsensus,
  hasProposedTx,
  isCurrentUserSigner,
  txHash,
  proposedAmount,
  gaPubKey,
  recipientAddress,
  confirmedBy,
  gaSecret,
  contractId,
  isConfirmedByCurrentUser,
  isAppHydrated,
  isRevoked,
  isSent,
} = toRefs(contractDetail)

const signerSdk = ref(null)
const contractAccount = ref(null)
const contractInstance = ref(null)
const spendTx = ref(null)

// todo comment watcher
// todo maybe onBeforeMount
const route = useRoute()

onMounted(async () => {
  clearState()

  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  const contractId = route.params.id
  const contractDetails = await getContractByContractId(contractId)
  gaPubKey.value = contractDetails.gaAddress // todo needed for loadContract -> updatecontractInfo but its kinda hasty
  gaSecret.value = contractDetails.gaSecret

  await loadContract()  // todo  can be this done better?

  signerSdk.value = await getUniversalStamp() //todo try to move it to state / store`

  contractAccount.value = await signerSdk.value.getAccount(gaPubKey.value)
  contractInstance.value = await signerSdk.value.getContractInstance(
    {
      source: multisigContract,
      contractAddress: contractAccount.value.contractId,
    },
  )
})


async function loadContract (t) {
  // todo this is wierd
  await updateContractInfo()
}

async function proposeTx () {
  spendTx.value = await aeWallet.sdk.spendTx({
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value, //todo not connected
    amount: proposedAmount.value, //todo not connected
  })

  await proposeIt(spendTx.value, contractAccount.value.contractId)

  await patchProposalByContractId(contractAccount.value.contractId, recipientAddress.value, proposedAmount.value)
  await updateContractInfo() // todo is ti reaally necceasry?
}


async function confirmTx () {
  await confirmIt(contractAccount.value.contractId, txHash.value)
  await updateContractInfo() // todo improve/reduce params
}

async function sendTx () {
  const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  await sendIt(contractInstance.value, gaPubKey.value, gaSecret.value, spendTx)
  await patchSentStatus(contractAccount.value.contractId)

  await updateContractInfo()
}


async function revokeTx () {
  // todo detect revoked status
  const spendTx = await aeWallet.sdk.spendTx({ //todo this is duplicated so try to separate it
    senderId: gaPubKey.value,
    recipientId: recipientAddress.value,
    amount: proposedAmount.value,
  })
  // todo is account necessary?

  await revokeIt(spendTx, contractAccount.value.contractId)
  await patchRevokedStatus(contractAccount.value.contractId)

  await updateContractInfo()
}
</script>
