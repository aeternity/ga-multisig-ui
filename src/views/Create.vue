<template>
  <div class="create">
    <h2>Create Multisig Wallet</h2>

    <signers-list
      v-if="signers && confirmedBy"
      :contract-id="contractId"
      :ga-public-key="gaKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <signers-form
      v-if="!signers && !confirmedBy"
      v-model:initConfirmationsRequired="initConfirmationsRequired"
      v-model:signersList="initSigners"
      @create-clicked="crateMultisigAccount"/>

    <confirmation-list
      v-else
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmations-map="confirmationsMap"/>

    <propose-form
      v-if="!hasProposedTx && !revokedBy"
      :class="[{'disabled': !signers && !confirmedBy}]"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>
    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>

    <send-form
      v-if="!revokedBy"
      :class="[{'disabled': !hasProposedTx}]"
      :has-consensus="hasConsensus"
      @revoke-clicked="revoke"/>
    <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
  </div>
</template>

<script setup>
import { Crypto } from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmationList from "../components/ConfirmationList"
import SendForm from "../components/SendForm"
import ProposeList from "../components/ProposeList"
import SignersList from "../components/SignersList"
import { useRoute } from "vue-router"
import {
  clearContractDetail,
  contractDetail,
  getSpendTx,
  initMultisigContract,
  loadContractDetail,
  patchProposal,
  patchRevokedBy,
  proposeTx,
  revokeTx,
  storeWalletToDB,
} from '../store'
import { onMounted, ref, toRefs } from "vue"

const route = useRoute()

const {
  gaKeyPair,
  contractId,
  contractAccount,
  contractInstance,
  hasProposedTx,
  hasConsensus,
  revokedBy,
  sentBy,
  isConfirmedByCurrentUser,
  isCurrentUserSigner,
  signers,
  proposedAmount,
  recipientAddress,
  confirmations,
  confirmationsRequired,
  confirmationsMap,
  confirmedBy,
  spendTx,
  txHash,
  version,
  nonce,
} = toRefs(contractDetail)
onMounted(() => clearContractDetail())

const initSigners = ref(['', ''])
const initConfirmationsRequired = ref(2)

async function crateMultisigAccount () {
  gaKeyPair.value = Crypto.generateKeyPair()

  await initMultisigContract(initSigners.value, initConfirmationsRequired.value, gaKeyPair.value)
  await loadContractDetail()
  await storeWalletToDB(contractId.value, gaKeyPair.value, initSigners.value)
}

async function propose () {
  const txToPropose = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
  await proposeTx(txToPropose, contractId.value)
  await patchProposal(contractId.value, recipientAddress.value, proposedAmount.value)
  await loadContractDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, contractId.value)
  await patchRevokedBy(contractId.value, revokedBy)
  await loadContractDetail()
}
</script>
