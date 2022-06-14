<template>
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
</template>
<script setup>
// todo remove unused
import {
  app,
  clearTransactionDetail,
  confirmTx,
  getContractByAddress,
  getSpendTx,
  getTransactionBySafe,
  hydrateApp,
  loadSafeDetail,
  loadTransactionDetail,
  proposeTx,
  revokeTx,
  safeDetail,
  sendTx,
  storeTransactionToDB,
  transactionDetail,
  updateProposeTx,
  updateRevokedBy,
  updateSentBy,
} from '../store'

import ConfirmationList from "../components/ConfirmationList"


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
  console.log('initTransaction')
  gaKeyPair.value = safeKeyPair.value

  // todo check if needed. Feed with props?
  const contract = getContractByAddress(gaKeyPair.value.publicKey)
  const transaction = getTransactionBySafe(contract.contractId)
  console.log('transaction', transaction)

  const isTransactionNew = transaction === undefined
  // const isTransactionNew = !!transaction.length
  const isTransactionTerminated = !!transaction?.sentBy || !!transaction?.revokedBy
  // console.log('transaction', transaction.sentBy)
  // console.log('transaction', transaction.revokedBy)
  console.log('isTransactionTerminated', isTransactionTerminated)
  console.log('isTransactionNew', isTransactionNew)

  if (!isTransactionNew || isTransactionTerminated) {
    await storeTransactionToDB(safeId.value)
  }
  await loadTransactionDetail()
}

async function resetTransaction () {
  await clearTransactionDetail()
  await initTransaction()
}

async function propose () {
  const txToPropose = await getSpendTx(gaKeyPair.value.publicKey, recipientAddress.value, proposedAmount.value)

  await proposeTx(txToPropose, safeId.value)
  await updateProposeTx(safeId.value, recipientAddress.value, proposedAmount.value)
  await loadTransactionDetail()
}

async function confirm () {
  await confirmTx(safeId.value, txHash.value)
  await loadTransactionDetail()
}

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, nonce.value)
  await updateSentBy(safeId.value, address.value)
  await loadTransactionDetail()
  await loadSafeDetail()
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, safeId.value)
  await updateRevokedBy(safeId.value, revokedBy)
  await loadTransactionDetail()
}
</script>
