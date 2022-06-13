import { createRouter, createWebHistory } from 'vue-router'
import CreateSafe from "../views/CreateSafe"
import Dashboard from "../views/Dashboard"
import Landing from "../views/Landing"
import Index from "../views/Index"
import TopUp from "../views/TopUp"

// todo fix routing - copu gnosis route names

const routes = [
  {
    path: '/',
    alias: '/landing',
    name: 'landing',
    component: Landing,
  },
  {
    alias: '/index',
    name: 'index',
    component: Index,
  },
  {
    alias: '/top-up',
    name: 'top-up',
    component: TopUp,
  },
  {
    path: '/create-safe',
    name: 'create-safe',
    component: CreateSafe,
  },
  {
    path: '/dashboard/:id',
    name: 'dashboard',
    component: Dashboard,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
