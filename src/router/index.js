import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'

const setMeta = (isAuthenticated, isGestOnly) => {
  return {
    isAuthenticated,
    isGestOnly,
  }
}

  const routes = [
    // {
    //   path: '/',
    //   redirect: '/main', 
    //   meta: setMeta(false, false),
    // },
    // {
    //   path: '/main',
    //   component: Main,
    //   meta: setMeta(false, true),
    // },


    // auth
    {
      path: '/login',
      component: Login,
      meta: setMeta(false, true),
    },

    {
      path: '/register',
      component: Register,
      meta: setMeta(false, true),
    },


  ]
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router