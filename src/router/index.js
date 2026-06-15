import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/DashboardView.vue'
import Registration from '../views/auth/Registration.vue'
import { useAuthStore } from '../store/useAuthStore.js'
import App from '../App.vue'

const setMeta = (isAuthenticated, isGestOnly) => {
  return {
    isAuthenticated,
    isGestOnly,
  }
}

const routes = [
  {
    path: '/auth',
    component: App
  },
  {
    path: '/',
    component: DashboardView,
    meta: setMeta(true, false), 
  },
  {
    path: '/login',
    component: Login,
    meta: setMeta(false, true),
  },
  {
    path: '/registration',
    component: Registration,
    meta: setMeta(false, true),
  },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: setMeta(true, false),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {

  const authStore = useAuthStore();

  const isUserAuthenticated = authStore.isLoggedIn

  if (to.meta.isAuthenticated && !isUserAuthenticated) {
    return '/login';
  } 
  if (to.meta.isGestOnly && isUserAuthenticated) {
    return '/';
  }
})


export default router