<template>
  <WalletInfo class="wallet-info"/>
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
      v-if="!hasProposedTx"
      :class="[{'disabled': !signers && !confirmedBy}]"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>
    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>

    <send-form
      v-if="!revokedBy || !sentBy"
      :class="[{'disabled': !hasProposedTx}]"
      :has-consensus="hasConsensus"
      @revoke-clicked="revoke"/>
    <!--    todo add charge button-->
    <h3 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h3>
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
import WalletInfo from "../components/WalletInfo"

import {
  clearState,
  contractDetail,
  getSpendTx,
  initMultisigContract,
  patchProposalByContractId,
  patchRevokedStatus,
  proposeTx,
  revokeTx,
  storeContractToDB,
  updateContractInfo,
} from '../store'
import { onMounted, ref, toRefs } from "vue"

const {
  version,
  confirmations,
  confirmationsRequired,
  signers,
  hasConsensus,
  hasProposedTx,
  isCurrentUserSigner,
  txHash,
  spendTx,
  proposedAmount,
  gaKeyPair,
  recipientAddress,
  confirmedBy,
  isConfirmedByCurrentUser,
  contractId,
  revokedBy,
  sentBy,
  contractAccount,
  contractInstance,
  confirmationsMap,
} = toRefs(contractDetail)

const signer1Key = ref('')
const signer2Key = ref('')
const requiredSignersAmount = ref(0)

onMounted(() => clearState())

async function crateGaAccount () {
  gaKeyPair.value = Crypto.generateKeyPair()
  // todo is this needed to push to store before? can it be reactive?
  // todo how to push this into state - because its not accissible with .value (torefs?)
  // todo try universal as this in data

  const signersss = [ //todo fix this
    signer1Key.value,
    signer2Key.value,
  ]

  const contractArgs = [
    requiredSignersAmount.value,
    signersss,
  ]

  await initMultisigContract(contractArgs, gaKeyPair.value)
  await updateContractInfo() //todo the order is hasty. Probably too much anstraction
  await storeContractToDB(contractId.value, gaKeyPair.value, signersss)
}

async function propose () {
  const tx = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)
// todo this does not serve well. Probably too much abstraction

  await proposeTx(tx, contractId.value)
  await patchProposalByContractId(contractId.value, recipientAddress.value, proposedAmount.value)
  await updateContractInfo()// todo is this neccessary? can be doe rectively?
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, contractId.value)
  await patchRevokedStatus(contractId.value, revokedBy)
  await updateContractInfo()
}

// todo conditions as computed properties
</script>
