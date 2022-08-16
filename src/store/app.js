import { reactive, toRefs } from "vue"
import { aeWallet } from "@/utils/aeternity"
import { getSignerContracts } from "@/store/backend";

export const app = reactive({
  isAppHydrated: false,
  safes: []
})

export const hydrateApp = async () => {
  const { isAppHydrated, safes } = toRefs(app)
  const { address } = toRefs(aeWallet)

  safes.value = await getSignerContracts(address.value)
  isAppHydrated.value = true
}

export const getGaAccountIdByContractId = (contractId) => {
  const { safes } = toRefs(app)

  const safe = safes.value.find(safe => safe.contractId === contractId)
  return safe.gaAccountId
}

