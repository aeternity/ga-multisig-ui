<template>
    <div class="home">
        <h1>Create Multisig Account</h1>
      <br>
      <br>
      <br>
      <button @click="handleClick">CreateGA</button>
      <signers-form/>
<!--      <propose-form/>-->
<!--      <confirm-form/>-->
<!--      <send-form/>-->
      <br>
      Result: {{ result }}
    </div>
</template>

<script>
import { createGA } from '../store'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"

export default {
  name: 'Home',
  components: { SendForm, ConfirmForm, ProposeForm, SignersForm },
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
