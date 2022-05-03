<template>
    <div class="home">
        <h1>Home Page</h1>

        <WalletInfo />
      <br>
      <br>
      <br>
      <button @click="handleClick">CreateGA</button>
      <br>
      Result: {{ result }}
    </div>
</template>

<script>
import WalletInfo from '../components/WalletInfo.vue'
import { createGA } from '../utils/aeternity'

export default {
  name: 'Home',
  components: { WalletInfo },
  data: () => ({
    result: null,
  }),
  methods: {
    async handleClick () {
      this.result = await createGA()
    },
  },
}
</script>
