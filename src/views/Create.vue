<template>
  <div class="create">
    <h2>Create Multisig Account</h2>

    <signer-list
      v-if="signers && confirmedBy"
      :contract-id="contractId"
      :ga-public-key="gaKeyPair.publicKey"
      :version="version"/>

    <signers-form
      v-if="!signers && !confirmedBy"
      v-model:signer1Key="signer1Key"
      v-model:signer2Key="signer2Key"
      v-model:required-signers-amount="requiredSignersAmount"
      @create-clicked="crateGaAccount"/>
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
    <!--    todo add charge button-->
    <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
  </div>
</template>

<script setup>
import { Crypto } from '@aeternity/aepp-sdk'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmationList from "../components/ConfirmationList"
import SendForm from "../components/SendForm"
import ProposeList from "./ProposeList"
import SignerList from "./SignerList"
import { useRoute } from "vue-router"
import {
  clearState,
  contractDetail,
  getSpendTx,
  initMultisigContract,
  loadContractDetail,
  patchProposalByContractId,
  patchRevokedStatus,
  proposeTx,
  revokeTx,
  storeContractToDB,
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
} = toRefs(contractDetail)

const signer1Key = ref('')
const signer2Key = ref('')
const requiredSignersAmount = ref(2)

onMounted(() => clearState())

async function crateGaAccount () {
  gaKeyPair.value = Crypto.generateKeyPair()

  const proposedSigners = [
    signer1Key.value,
    signer2Key.value,
  ]

  const contractArgs = [
    requiredSignersAmount.value,
    proposedSigners,
  ]

  await initMultisigContract(contractArgs, gaKeyPair.value)
  await loadContractDetail() //todo the order is hasty. Probably too much anstraction
  await storeContractToDB(contractId.value, gaKeyPair.value, proposedSigners)
}

async function propose () {
  const tx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
// todo this does not serve well. Probably too much abstraction

  await proposeTx(tx, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await loadContractDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, contractId.value)
  await patchRevokedStatus(contractId.value, revokedBy)
  await loadContractDetail()
}
</script>
