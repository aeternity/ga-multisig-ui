<template>
  <header>
    <router-link to="/landing" class="home-link">
      <img alt="Aeternity" src="../assets/logo.svg" width="60"/>
      <h1> Multisig Safe</h1>
    </router-link>
    <user-status/>
  </header>
</template>

<script setup>
import UserStatus from "./UserStatus"</script>

<style scoped>

h1 {
  color: #de3f6b;
  font-size: 24px;
  margin-left: 20px;
}

header {
  grid-area: header;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgba(40, 54, 61, 0.18) 0px 2px 4px 0px;
  padding: 0 12px;
}

.home-link {
  display: flex;
  text-decoration: none;
}
</style>
