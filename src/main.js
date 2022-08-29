import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import "simpledotcss/simple.css";

createApp(App).use(router).mount("#app");
