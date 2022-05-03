<template>
  <div class="home">
    <h1>Create Multisig Account</h1>
    <br>
    <br>
    <br>
    <button @click="handleClick">createGAFlow</button>
    <signers-form
      v-if="signer1 && signer2"
      :signer1="signer1"
      :signer2="signer2"
      @amount-updated="handleAmountUpdated"
      @create-clicked="handleCreateClicked"/>
    <propose-form
      :recipient="recipient"
      :proposed-amount="proposedAmount"
      @propose-clicked="handleProposeClicked"/>
    <confirm-form
      @confirm-clicked="handleConfirmClicked"
      @revoke-clicked="handleRevokeClicked"/>
          <send-form
            @send-clicked="handleSendClicked"
            @revoke-clicked="handleRevokeClicked" />
    <!--    todo add charge button-->
    <br>
    Result: {{ result }}
  </div>
</template>

<script>
import {
  Crypto,
} from '@aeternity/aepp-sdk'
import { createGA } from '../store'
import SignersForm from "../components/SignersForm"
import ProposeForm from "../components/ProposeForm"
import ConfirmForm from "../components/ConfirmForm"
import SendForm from "../components/SendForm"
import CreateAccountForm from "../components/CreateAccountForm"

export default {
  name: 'Home',
  components: { CreateAccountForm, SendForm, ConfirmForm, ProposeForm, SignersForm },
  data: () => ({
    // todo pass models
    // todo remove word test
    result: null,
    signer1: Crypto.generateKeyPair(),
    signer2: Crypto.generateKeyPair(),
    recipient: Crypto.generateKeyPair(),
    proposedAmount: 1000,

  }),
  computed: {
// todo conditions as computed properties
  },
  methods: {
    async handleClick () {
      this.result = await createGA()
    },
    handleAmountUpdated (amount) {
      this.signersAmount = amount
    },
    handleCreateClicked (data) {
      console.log(data)
    },
    handleProposeClicked (data) {
      console.log(data)
    },
    handleConfirmClicked (data) {
      console.log(data)
    },
    handleRevokeClicked (data) {
      console.log(data)
    },
    handleSendClicked (data) {
      // todo rename 'handle'  functions
      console.log(data)
    },
  },
}
</script>
