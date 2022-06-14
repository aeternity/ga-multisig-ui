<template>
  <div>
    <div v-if="address" class="wallet">
      <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40">
      <div class="address"> {{ address }}
        <br>
        Chain name
        <!--          todo chain name-->
      </div>
    </div>
    <div v-else>
      <button @click="connect">
        Connect
      </button>
    </div>
  </div>
</template>
<script setup>
import { aeInitWallet, aeWallet } from "../utils/aeternity"
import { toRefs } from "vue"

const { walletStatus, address } = toRefs(aeWallet)

async function connect () {
  await aeInitWallet()
}
</script>
<style scoped>

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgba(40, 54, 61, 0.18) 0px 2px 4px 0px;
  padding: 0 12px;
}

aside {
  grid-area: aside;
  padding: 0;
  margin-left: 0;
  width: 100%;
  border: 0;
}

main {
  grid-area: main;
  overflow: auto;
  padding-top: 0;
}

article {
  border: 0;

}

.wallet {
  display: flex;
  width: 280px;
}

h1 {
  color: #de3f6b;
  font-size: 24px;
  margin-left: 20px;
}

</style>
<style>

body {
//grid-template-columns: 1fr min(100rem, 100%) 1fr; display: block !important; font-family: Avenir, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; padding: 0;
}


li {
  list-style: none;
}

ul {
  padding: 0;
}

small {
  color: gray;
}

.address {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
