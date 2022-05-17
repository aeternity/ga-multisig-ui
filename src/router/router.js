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
