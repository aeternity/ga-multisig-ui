import { reactive, toRefs } from "vue"
import { aeWallet } from "../utils/aeternity"
import { restoreWalletsFromDB } from "./offChainDB"
import { loadChainNAmes } from "./chainNames"

export const app = reactive({
  multisigWallets: null,
  myWallets: null,
  isAppHydrated: false,
})

export const hydrateApp = async () => {
  const { isAppHydrated, myWallets, multisigWallets } = toRefs(app)
  const { address } = toRefs(aeWallet)

  await loadChainNAmes()
  multisigWallets.value = await restoreWalletsFromDB()
  myWallets.value = getMyWallets(multisigWallets, address)
  isAppHydrated.value = true
}

export const getMyWallets = (contracts, address) => {
  return contracts.value.filter(contract => contract.signers.includes(address.value))
}

export const getContractByAddress = (gaAddress) => {
  const { multisigWallets } = toRefs(app)
  return multisigWallets.value.find(contract =>
    contract.gaKeyPair.publicKey === gaAddress,
  )
}

export const getContractByContractId = (contractId) => {
  const { multisigWallets } = toRefs(app)
  return multisigWallets.value.find(contract =>
    contract.contractId === contractId,
  )
}
