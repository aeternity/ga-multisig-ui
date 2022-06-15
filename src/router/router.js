import { createRouter, createWebHistory } from 'vue-router'
import CreateSafe from "../views/CreateSafe"
import Dashboard from "../views/Dashboard"
import Landing from "../views/Landing"
import Index from "../views/Index"
import TopUp from "../views/TopUp"

// todo route welcome

const routes = [
  {
    path: '/',
    name: 'landing',
    component: Landing,
  },
  {
    path: '/app',
    name: 'app',
    component: Index,
  },
  {
    path: '/app/top-up',
    name: 'top-up',
    component: TopUp,
  },
  {
    path: '/app/open',
    name: 'open',
    component: CreateSafe,
  },
  {
    path: '/app/:id',
    name: 'detail',
    component: Dashboard,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
