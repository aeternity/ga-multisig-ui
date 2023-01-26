<template>
  <div class="transaction-detail">
    <propose-form
      v-if="isProposeFormDisplayed"
      v-model:recipient-address="recipientAddress"
      v-model:proposed-amount-ae="proposedAmountAe"
      @propose-clicked="propose"
      @max-amount-clicked="maxAmount"
    />
    <div v-else>
      <propose-list
        v-if="spendTx"
        :proposed-amount="proposedAmount"
        :proposed-fee="proposedFee"
        :recipientAddress="recipientAddress"
      />
      <span v-else
        >Transaction not available, it's recommended to manually add it
        (currently not possible) or revoke the transaction for safety.</span
      >
    </div>
    <confirm-form
      v-if="isConfirmFormDisplayed"
      :class="[{ disabled: !hasProposedTx }]"
      :is-confirm-hidden="isConfirmedByCurrentUser"
    />
    <send-form
      v-if="isSendFormDisplayed"
      :class="[{ disabled: !hasConsensus }]"
      :has-consensus="hasConsensus"
      :is-multisig-account-charged="isMultisigAccountCharged"
    />
    <div v-if="isRestartTransactionDisplayed">
      <button @click="resetTransaction">New Transaction</button>
    </div>
  </div>
</template>
<script setup>
import ProposeForm from "./ProposeForm";
import ProposeList from "./ProposeList";
import ConfirmForm from "./ConfirmForm";
import SendForm from "./SendForm";
import { computed, toRefs } from "vue";
import {
  clearContractDetail,
  contractDetail,
  getSpendTx,
  loadContractDetail,
  proposeTx,
} from "@/store";
import { storeTransaction } from "@/store/backend";
import {
  generateKeyPair,
  MemoryAccount,
  Tag,
  toAe,
  toAettos,
  unpackTx,
} from "@aeternity/aepp-sdk";
import { sdk, wallet } from "@/utils/aeternity";
import BigNumber from "bignumber.js";
import multisigContract from "ga-multisig-contract/SimpleGAMultiSig.aes";

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
} = toRefs(contractDetail);

const isProposeFormDisplayed = computed(
  () => !hasProposedTx.value && !(revokedBy.value || sentBy.value)
);
const isConfirmFormDisplayed = computed(
  () => !hasConsensus.value && !(revokedBy.value || sentBy.value)
);
const isSendFormDisplayed = computed(() => !(revokedBy.value || sentBy.value));
const isRestartTransactionDisplayed = computed(
  () => revokedBy.value || sentBy.value
);

async function resetTransaction() {
  await clearContractDetail();
  await loadContractDetail(contractId.value);
}

async function propose() {
  const txToPropose = await getSpendTx(
    accountId.value,
    recipientAddress.value,
    toAettos(proposedAmountAe.value)
  );
  const { networkId } = toRefs(wallet);

  const txHash = await proposeTx(
    networkId.value,
    txToPropose,
    contractId.value
  );

  await storeTransaction(networkId.value, txToPropose, txHash);
  await loadContractDetail(contractId.value);
}

async function maxAmount() {
  const { accountId } = toRefs(contractDetail);
  const balance = await sdk.getBalance(accountId.value, {});

  const spendTx = await getSpendTx(
    accountId.value,
    generateKeyPair().publicKey,
    balance
  );

  const metaTx = await sdk.createMetaTx(
    spendTx,
    { source: multisigContract, args: [1] },
    "authorize",
    { onAccount: new MemoryAccount({ gaId: accountId.value }) }
  );

  proposedAmountAe.value = toAe(
    BigNumber(balance)
      .minus(BigNumber(unpackTx(spendTx).tx.fee))
      .minus(BigNumber(unpackTx(metaTx).tx.encodedTx.tx.fee))
      .minus(BigNumber(12308).times(1000000000)) // TODO gas currently can't be estimated for this, but is constant
  );
}
</script>

<style scoped>
.transaction-detail {
  width: 500px;
  margin-right: 15px;
}
</style>
