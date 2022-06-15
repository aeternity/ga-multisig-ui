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
        <router-link to="/app/top-up">Top up</router-link>
        your account to be able to Send Tx
      </div>
    </li>
  </ul>
</template>
<script setup>
// todo remove unused
import {
  confirmTx,
  loadSafeDetail,
  loadTransactionDetail,
  revokeTx,
  safeDetail,
  sendTx,
  transactionDetail,
  updateRevokedBy,
  updateSentBy,
} from '../store'

import ConfirmationList from "../components/ConfirmationList"

import { toRefs } from "vue"
import { useRoute } from "vue-router"
import { aeWallet } from "../utils/aeternity"

const { address } = toRefs(aeWallet)

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

const { safeId } = toRefs(safeDetail)

const route = useRoute()

async function confirm () {
  await confirmTx(safeId.value, txHash.value)
  await loadTransactionDetail()
}

async function send () {
  console.log('send', gaKeyPair.value, spendTx.value, nonce.value)
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
