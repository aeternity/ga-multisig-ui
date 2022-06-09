import { createRouter, createWebHistory } from 'vue-router'
import CreateSafe from "../views/CreateSafe"
import CreateTransaction from "../views/CreateTransaction"
import DetailSafe from "../views/Dashboard"
import Landing from "../views/Landing"
import Index from "../views/Index"
import TopUp from "../components/TopUp"

// todo fix routing

const routes = [
  {
    path: '/',
    alias: '/landing',
    name: 'landing',
    component: Landing,
  },
  // {
  //   alias: '/my-safes',
  //   name: 'my-safes',
  //   component: MySafes,
  // },
  {
    alias: '/index',
    name: 'index',
    component: Index,
  },
  {
    alias: '/index',
    name: 'index',
    component: Index,
  },
  {
    alias: '/topup',
    name: 'topup',
    component: TopUp,
  },
  {
    path: '/create-safe',
    name: 'create-safe',
    component: CreateSafe,
  },
  {
    path: '/create-transaction',
    name: 'create-transaction',
    component: CreateTransaction,
  },
  {
    path: '/dashboard/:id',
    name: 'dashboard',
    component: DetailSafe,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
