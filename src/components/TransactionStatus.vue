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
        :class="[{'disabled': isConfirmationListDisabled}]"
        :confirmations-map="confirmationsMap"/>
    </li>
    <li>
      <strong> Sent</strong>
      <hr>
      <button v-if="isConfirmActionDisplayed" @click="confirm">Confirm Tx</button>
      <button v-if="isSendActionDisplayed" @click="send">Send Tx</button>
      <button v-if="hasProposedTx" @click="revoke">Revoke Tx</button>
      <div v-if="isTopUpPromptDisplayed">
        <router-link to="/app/top-up">Top up</router-link>
        your account to be able to Send Tx
      </div>
    </li>
  </ul>
</template>
<script setup>
import {
  confirmTx,
  contractDetail,
  loadContractDetail,
  revokeTx,
  sendTx,
} from '@/store'

import ConfirmationList from "../components/ConfirmationList"

import { computed, toRefs } from "vue"
import { aeWallet } from "@/utils/aeternity"

const { address } = toRefs(aeWallet)

const {
  accountId,
  isMultisigAccountCharged,
  contractId,
  hasProposedTx,
  hasConsensus,
  isConfirmedByCurrentUser,
  signers,
  confirmations,
  confirmationsRequired,
  confirmationsMap,
  confirmedBy,
  spendTx,
  txHash,
  nonce,
} = toRefs(contractDetail)

const isSendActionDisplayed = computed(() => hasProposedTx.value && hasConsensus.value && isMultisigAccountCharged.value)
const isTopUpPromptDisplayed = computed(() => hasConsensus.value && !isMultisigAccountCharged.value)
const isConfirmActionDisplayed = computed(() => hasProposedTx.value && !isConfirmedByCurrentUser.value)
const isConfirmationListDisabled = computed(() => signers.value && !confirmedBy.value)


async function confirm () {
  await confirmTx(contractId.value, txHash.value)
  await loadContractDetail(contractId.value)
}

async function send () {
  await sendTx(accountId.value, spendTx.value, nonce.value)
  await loadContractDetail(contractId.value)
}

async function revoke () {
  await revokeTx(txHash.value, contractId.value)
  await loadContractDetail(contractId.value)
  // TODO why isn't the page reloading info?
}
</script>
