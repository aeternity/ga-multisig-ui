<template>
  <div class="transaction-detail">
    <propose-form
      v-if="isProposeFormDisplayed"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount-ae="proposedAmountAe"
      @propose-clicked="propose"
      @max-amount-clicked="maxAmount"/>
    <div v-else>
      <propose-list
        v-if="spendTx"
        :proposed-amount="proposedAmount"
        :proposed-fee="proposedFee"
        :recipientAddress="recipientAddress"/>
      <span v-else>Transaction not available, it's recommended to manually add it (currently not possible) or revoke the transaction for safety.</span>
    </div>
    <confirm-form
      v-if="isConfirmFormDisplayed"
      :class="[{'disabled': !hasProposedTx}]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
    />
    <send-form
      v-if="isSendFormDisplayed"
      :class="[{'disabled': !hasConsensus}]"
      :has-consensus="hasConsensus"
      :is-multisig-account-charged="isMultisigAccountCharged"
    />
    <div v-if="isRestartTransactionDisplayed">
      <button @click="resetTransaction">New Transaction</button>
    </div>
  </div>
</template>
<script setup>
import ProposeForm from "./ProposeForm"
import ProposeList from "./ProposeList"
import ConfirmForm from "./ConfirmForm"
import SendForm from "./SendForm"
import { computed, toRefs } from "vue"
import {
  clearContractDetail,
  contractDetail,
  getSpendTx,
  loadContractDetail,
  proposeTx,
} from "@/store"
import { storeTransaction } from "@/store/backend";
import { generateKeyPair, toAe, toAettos, unpackTx } from "@aeternity/aepp-sdk";
import { sdk } from "@/utils/aeternity";
import BigNumber from "bignumber.js";

const {
  accountId,
  isMultisigAccountCharged,
  contractId,
  hasProposedTx,
  hasConsensus,
  revokedBy,
  sentBy,
  isConfirmedByCurrentUser,
  proposedAmount,
  proposedAmountAe,
  proposedFee,
  recipientAddress,
  spendTx,
} = toRefs(contractDetail)

const isProposeFormDisplayed = computed(() => !hasProposedTx.value && !(revokedBy.value || sentBy.value))
const isConfirmFormDisplayed = computed(() => !hasConsensus.value && !(revokedBy.value || sentBy.value))
const isSendFormDisplayed = computed(() => !(revokedBy.value || sentBy.value))
const isRestartTransactionDisplayed = computed(() => revokedBy.value || sentBy.value)

async function resetTransaction () {
  await clearContractDetail()
  await loadContractDetail(contractId.value)
}

async function propose () {
  const txToPropose = await getSpendTx(accountId.value, recipientAddress.value, toAettos(proposedAmountAe.value))
  const txHash = await proposeTx(txToPropose, contractId.value)

  await storeTransaction(txToPropose, txHash);
  await loadContractDetail(contractId.value)
}

async function maxAmount() {
  const { accountId } = toRefs(contractDetail)
  const balance = await sdk.getBalance(accountId.value, {});
  const tx = await getSpendTx(accountId.value, generateKeyPair().publicKey, balance).then(unpackTx)
  proposedAmountAe.value = toAe(BigNumber(balance).minus(BigNumber(tx.tx.fee)).minus(BigNumber(88748000000000))) // todo figure out why actual fee is higher, figure out how to estimate correct ga fee
}

</script>

<style scoped>
.transaction-detail {
  width: 500px;
  margin-right: 15px;
}
</style>
