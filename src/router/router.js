import { createRouter, createWebHistory } from 'vue-router'
import Create from '../views/Create.vue'
import Resume from "../views/Resume"

const routes = [
  {
    path: '/',
    name: 'create',
    component: Create,
  },
  {
    path: '/load',
    name: 'load',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Load.vue'),
  },
  {
    path: '/resume',
    name: 'resume',
    component: Resume,
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
