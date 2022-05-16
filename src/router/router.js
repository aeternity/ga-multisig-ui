import { createRouter, createWebHistory } from 'vue-router'
import Create from "../views/Create.vue"
import Resume from "../views/Resume"
import Load from "../views/Load"

const routes = [
  {
    path: '/',
    name: 'load',
    component: Load,
  },
  {
    path: '/create',
    name: 'create',
    component: Create,
  },
  {
    // todo rename to slug
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
