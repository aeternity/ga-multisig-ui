<template>
  <div>
    <WalletInfo class="wallet-info"/>
    Detail {{ $route.params.id }}
  </div>
</template>
<script>
import WalletInfo from "../components/WalletInfo"
import { aeWallet } from "../utils/aeternity"
import { COMPILER_URL } from "../utils/aeternity/configs"
import { updateContractInfo, getContractByContractId } from "../store"
import { Node, Universal } from '@aeternity/aepp-sdk'

export default {
  components: { WalletInfo },
  async mounted () {
    const contractId = this.$route.params.id
    const contractDetails = await getContractByContractId(contractId)
    console.log('contractDetails', contractDetails)
    await this.loadContract(contractDetails.gaAddress,contractDetails.gaSecret )
  },
  computed: {
    walletStatus () {
      return aeWallet.walletStatus
    },
    address () {
      return aeWallet.address
    },
  },
  methods: {
    async loadContract (gaAddress, gaSecret) {
      const signerSdk = await Universal({
        nodes: [{
          name: 'testnet',
          instance: await Node({ url: 'https://testnet.aeternity.io' }),
        }],
        compilerUrl: COMPILER_URL,
      })
      await updateContractInfo(signerSdk, gaAddress, gaSecret)
    },
  },
}

</script>
