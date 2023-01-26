import { reactive, toRefs } from "vue";
import { sdk, wallet } from "@/utils/aeternity";
import { getSignerContracts } from "@/store/backend";
import { clearContractDetail } from "@/store/contractDetail";

export const app = reactive({
  isAppHydrated: false,
  currentSafeContractId: null,
  safes: {},
});

export const hydrateApp = async () => {
  const { isAppHydrated, safes, currentSafeContractId } = toRefs(app);
  const { address, networkId } = toRefs(wallet);
  clearContractDetail();

  safes.value = await getSignerContracts(networkId.value, address.value);
  currentSafeContractId.value = Object.entries(safes.value).reduce(
    (acc, [contractId, { height }]) => {
      if (height >= acc.maxHeight) {
        acc.maxHeight = height;
        acc.latestContractId = contractId;
      }
      return acc;
    },
    {
      maxHeight: 0,
      latestContractId: null,
    }
  ).latestContractId;
  getSafesBalances();
  isAppHydrated.value = true;
};

export const getGaAccountIdByContractId = async (contractId) => {
  const { ownerId } = await sdk.getContract(contractId);
  return ownerId;
};

const getSafesBalances = () => {
  const { safes } = toRefs(app);
  Object.entries(safes.value).reduce(
    async (accPromise, [contractId, { gaAccountId }]) => {
      await accPromise;
      safes.value[contractId].balance = await sdk.getBalance(gaAccountId, {});
    },
    Promise.resolve()
  );
};
