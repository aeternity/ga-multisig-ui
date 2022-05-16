import { createRouter, createWebHistory } from 'vue-router'
import Create from "../views/Create"
import Detail from "../views/Detail"
import Index from "../views/Index"

const routes = [
  {
    path: '/',
    name: 'load',
    component: Index,
  },
  {
    path: '/create',
    name: 'create',
    component: Create,
  },
  {
    // todo make id in url and load detail
    path: '/detail',
    name: 'detail',
    component: Detail,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
