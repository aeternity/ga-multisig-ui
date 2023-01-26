<template>
  <div class="container" v-if="isAppHydrated">
    <the-header class="header" />

    <aside v-if="route.name !== 'landing'">
      <the-sidebar />
    </aside>

    <main>
      <article>
        <router-view />
      </article>
    </main>
  </div>
  <loader-image v-else />
</template>

<script setup>
import { onMounted, toRefs, watch } from "vue";
import { initWallet, wallet } from "./utils/aeternity";
import { app, contractDetail, hydrateApp } from "./store";
import { useRoute, useRouter } from "vue-router";

import TheHeader from "./components/TheHeader";
import TheSidebar from "./components/TheSidebar";
import LoaderImage from "./components/LoaderImage";

const { walletStatus, address } = toRefs(wallet);
const { contractId } = toRefs(contractDetail);
const { isAppHydrated } = toRefs(app);

const route = useRoute();
const router = useRouter();

onMounted(async () => {
  await initWallet();
});

watch(walletStatus, async (newStatus) => {
  console.log(newStatus);
  if (newStatus === "connected") {
    // wait for wallet connection because wallet =address is needed to filter My Contracts
    // this should be done in mounted hook
    router.push("/");
    await hydrateApp();
  }
});
</script>

<style scoped>
.container {
  display: grid;
  grid-template-areas:
    "header header"
    "aside main";
  grid-template-rows: 55px calc(100vh - 55px);
  grid-template-columns: 200px auto;
}

.header {
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
</style>

<style>
body {
  grid-template-columns: 1fr min(100rem, 100%) 1fr;
  display: block !important;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 0;
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

.disabled {
  opacity: 0.2;
  filter: blur(1px);
  pointer-events: none;
  transition: 0.5s;
}

.hidden {
  display: none;
}
</style>
