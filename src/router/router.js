import { createRouter, createWebHistory } from 'vue-router'
import Create from "../views/Create"
import Detail from "../views/Detail"
import Landing from "../views/Landing"
import List from "../views/List"
import Index from "../views/Index"

const routes = [
  {
    path: '/',
    alias: '/landing',
    name: 'landing',
    component: Landing,
  },
  {
    alias: '/list',
    name: 'list',
    component: List,
  },
  {
    alias: '/index',
    name: 'index',
    component: Index,
  },
  {
    path: '/create',
    name: 'create',
    component: Create,
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: Detail,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
