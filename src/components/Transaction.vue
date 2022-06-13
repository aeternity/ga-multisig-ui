<template>
  <div class="transaction" v-if="gaKeyPair && signers">

    <div class="transaction-detail">
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
        :is-confirm-hidden="isConfirmedByCurrentUser"

        :class="[{'disabled': !hasProposedTx}]"
      />

      <send-form
        v-if="!(revokedBy || sentBy)"
        :class="[{'disabled': !hasConsensus}]"
        :has-consensus="hasConsensus"
        :is-multisig-account-charged="isMultisigAccountCharged"
      />
      <h5 v-if="revokedBy">The transaction has been revoked by user {{ revokedBy }}</h5>
      <h5 v-if="sentBy">
        The transaction has been sent by user <i>{{ sentBy }}</i> to account
        <a :href="`https://explorer.testnet.aeternity.io/account/${recipientAddress}`"
           target="_blank">
          {{ recipientAddress }}
        </a>
      </h5>
      <div v-if="revokedBy || sentBy">
        <!--todo new transaction button clear state and new db entry-->
        <router-link to="/create-transaction">
          <button>New Transaction</button>
        </router-link>
      </div>
    </div>

    <div class="transaction-status">
      <strong>Status</strong>
      <ul>
        <li>
          {{ hasProposedTx ? '&#x2705;' : '&#x274C' }}
          <strong> Proposal</strong>
        </li>
        <li>
          {{ hasConsensus ? '&#x2705;' : '&#x274C' }}
          <strong>
            Consensus {{ confirmations }} / {{ confirmationsRequired }}
          </strong>
          <br>
          <confirmation-list
            :class="[{'disabled': signers && !confirmedBy}]"
            :confirmations-map="confirmationsMap"/>
        </li>
        <li>
          {{ !!sentBy ? '&#x2705;' : '&#x274C' }}
          <strong> Sent</strong>
          <hr>
          <button v-if="hasProposedTx && !isConfirmedByCurrentUser" @click="confirm">Confirm Tx</button>
          <button v-if="hasProposedTx && hasConsensus && isMultisigAccountCharged" @click="send">Send Tx</button>
          <button v-if="hasProposedTx" @click="revoke">Revoke Tx</button>
          <div v-if="hasConsensus && !isMultisigAccountCharged">
            <router-link to="/top-up">Top up</router-link>
            your account to be able to Send Tx
          </div>
        </li>
      </ul>
    </div>
  </div>
  <loader-image v-else/>
</template>

<script setup>
import {
  app,
  clearTransactionDetail,
  confirmTx,
  getSpendTx,
  hydrateApp,
  loadSafeDetail,
  loadTransactionDetail,
  patchRevokedBy,
  patchSentBy,
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

import { onMounted, toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"


const {
  address,
} = toRefs(aeWallet)

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
  safeKeyPair,
} = toRefs(safeDetail)

const { isAppHydrated } = toRefs(app)

const route = useRoute()

onMounted(async () => {
  clearTransactionDetail()

  //when going directly to detail page from pasted url
  if (!isAppHydrated.value) {
    await hydrateApp()
  }

  await initTransaction()
  // todo move conditions here
})


async function initTransaction () {
  // const safe = await getSafeByContractId(safeId.value)

  gaKeyPair.value = safeKeyPair.value

  // todo check if needed. Feed with props?
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

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, contractInstance.value)
  await patchSentBy(safeId.value, address.value)
  await loadTransactionDetail()
  await loadSafeDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, safeId.value)
  await patchRevokedBy(safeId.value, revokedBy)
  await loadTransactionDetail()
}
</script>

<style scoped>
.transaction {
  display: flex;
}

.transaction-detail {
  width: 500px;
  margin-right: 15px;
}

.transaction-status {
  width: 200px;
}
</style>
