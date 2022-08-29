<template>
  <div class="create-safe">
    <h2>Welcome to Multisig</h2>
    <p>
      Create a new Safe that is controlled by one or multiple owners.<br />
      You will be required to pay a network fee for creating your new Safe.<br />
      Here is how to get started:
    </p>
    <router-link to="/app/open">
      <button>New Safe</button>
    </router-link>
  </div>
</template>

<script setup>
import { wallet } from "@/utils/aeternity";
import { onMounted, toRefs } from "vue";
import { app, contractDetail } from "@/store";
import { useRouter } from "vue-router";

const { address } = toRefs(wallet);
const { contractId } = toRefs(contractDetail);
const { currentSafeContractId } = toRefs(app);

const router = useRouter();

onMounted(async () => {
  if (currentSafeContractId.value) {
    await router.push({ path: `/app/${currentSafeContractId.value}` });
  } else {
    await router.push({ path: "/app" });
  }
});
</script>
