import { createRouter, createWebHistory } from 'vue-router'
import Create from "../views/Create"
import Detail from "../views/Detail"
import Welcome from "../views/Welcome"
import List from "../views/List"

const routes = [
  {
    path: '/',
    alias: '/welcome',
    name: 'welcome',
    component: Welcome,
  },
  {
    alias: '/list',
    name: 'list',
    component: List,
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
