<template>
  <div class="detail" v-if="gaKeyPair && signers">
    <h2>Multisig Safe Detail</h2>

    <signers-list
      :contract-id="safeId"
      :ga-public-key="gaKeyPair.publicKey"
      :version="version"
      :nonce="nonce"/>

    <confirmation-list
      :class="[{'disabled': signers && !confirmedBy}]"
      :confirmations="confirmations"
      :confirmations-required="confirmationsRequired"
      :confirmations-map="confirmationsMap"/>

    <propose-form
      v-if="!hasProposedTx  && !(revokedBy || sentBy)"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount="proposedAmount"
      @propose-clicked="propose"/>

    <propose-list
      v-else
      :proposed-amount="proposedAmount"
      :recipientAddress="recipientAddress"/>

    <confirm-form
      v-if="!hasConsensus && !(revokedBy || sentBy)"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
      @confirm-clicked="confirm"
      @revoke-clicked="revoke"/>

    <send-form
      v-if="!(revokedBy || sentBy)"
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      :is-multisig-account-charged="isMultisigAccountCharged"
      @send-clicked="send"
      @revoke-clicked="revoke"
      @charge-clicked="chargeAccount"/>
    <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
    <h5 v-if="sentBy">
      The transaction has been sent by user <i>{{ sentBy }}</i> to account
      <a :href="`https://explorer.testnet.aeternity.io/account/${recipientAddress}`"
         target="_blank">
        {{ recipientAddress }}
      </a>
    </h5>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearTransactionDetail,
  confirmTx,
  getSafeByContractId,
  getSpendTx,
  hydrateApp,
  loadTransactionDetail,
  patchRevokedBy,
  patchSentBy,
  preChargeMultisigAccount,
  proposeTx,
  revokeTx,
  safeDetail,
  sendTx,
  storeTransactionToDB,
  transactionDetail,
} from '../store'

import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import ConfirmationList from "../components/ConfirmationList"
import LoaderImage from "../components/LoaderImage"
import ProposeList from "../components/ProposeList"
import SignersList from "../components/SignersList"

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"

const {
  address,
} = toRefs(aeWallet)

const route = useRoute()
const {
  gaKeyPair,
  isMultisigAccountCharged,
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
} = toRefs(transactionDetail)

const {
  safeId,
} = toRefs(safeDetail)

const { isAppHydrated } = toRefs(app)


onMounted(async () => {
  clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await initTransaction()
  // await subscribeToSocket(safeId.value)
})

async function initTransaction () {
  const neco = await getSafeByContractId(safeId.value)
  gaKeyPair.value = neco.gaKeyPair

  await loadTransactionDetail()
}

async function propose () {
  const txToPropose = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)

  await proposeTx(txToPropose, safeId.value)
  await storeTransactionToDB(safeId.value, recipientAddress.value, proposedAmount.value)
  await loadTransactionDetail()
}

async function confirm () {
  await confirmTx(safeId.value, txHash.value)
  await loadTransactionDetail()
}

async function chargeAccount () {
  // workaround to pre charge multisig account in order to have enough funds to make sendTx
  await preChargeMultisigAccount(gaKeyPair.value.publicKey)
  await loadTransactionDetail()
}

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, contractInstance.value)
  await patchSentBy(safeId.value, address.value)
  await loadTransactionDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, safeId.value)
  await patchRevokedBy(safeId.value, revokedBy)
  await loadTransactionDetail()
}
</script>
