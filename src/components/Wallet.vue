<template>
  <div class="wallet">
    <img :src="`https://avatars.z52da5wt.xyz/${address}`" alt="" width="40" />
    <div class="address">{{ address }}</div>
  </div>
</template>

<script>
export default {
  props: {
    address: String,
  },
};
</script>

<style scoped>
.wallet {
  display: flex;
  width: 280px;
}

.wallet img {
  margin-right: 5px;
}

.address {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
