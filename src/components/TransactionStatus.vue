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
  contractDetail,
  loadContractDetail,
  revokeTx,
  sendTx,
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
} = toRefs(contractDetail)


const route = useRoute()

async function confirm () {
  await confirmTx(contractId.value, txHash.value)
  await loadContractDetail(contractId.value)
}

async function send () {
  await sendTx(gaKeyPair.value, spendTx.value, nonce.value)
  await updateSentBy(contractId.value, address.value)
  await loadContractDetail(contractId.value)
}

async function revoke () {
  const revokedBy = await revokeTx(spendTx.value, contractId.value)
  await updateRevokedBy(contractId.value, revokedBy)
  await loadContractDetail(contractId.value)
}
</script>
