import { reactive, toRefs } from "vue"
import { sdk, wallet } from "@/utils/aeternity"
import { getSignerContracts } from "@/store/backend";

export const app = reactive({
  isAppHydrated: false,
  currentSafeContractId: null,
  safes: {}
})

export const hydrateApp = async () => {
  const { isAppHydrated, safes } = toRefs(app)
  const { address } = toRefs(wallet)

  safes.value = await getSignerContracts(address.value)
  getSafesBalances()
  isAppHydrated.value = true
}

export const getGaAccountIdByContractId = async (contractId) => {
  const { ownerId } = await sdk.getContract(contractId)
  return ownerId;
}

const getSafesBalances = () => {
  const {safes} = toRefs(app)
  Object.entries(safes.value).reduce(async (accPromise, [contractId, {gaAccountId}]) => {
    await accPromise;
    console.log("getSafesBalances", contractId, gaAccountId)
    safes.value[contractId].balance = await sdk.getBalance(gaAccountId, {});
  }, Promise.resolve())
}
