import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/DashboardView.vue'
import Registration from '../views/auth/Registration.vue'
import { useAuthStore } from '../store/useAuthStore.js'
import App from '../App.vue'
import PlatformsView from '../views/PlatformsView.vue'
import MockDataView from '../views/MockDataView.vue'
import LandingView from '../views/LandingView.vue'

const setMeta = (isAuthenticated, isGuestOnly) => {
  return {
    isAuthenticated,
    isGuestOnly,
  }
}

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { isGuestOnly: false }
  },
  {
    path: '/platforms',
    name: 'platform',
    component: PlatformsView,
    meta: { isAuthenticated: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { isGuestOnly: true }
  },
  {
    path: '/registration',
    name: 'registration',
    component: Registration,
    meta: { isGuestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { isAuthenticated: true }
  },
  {
    path: '/mockdata',
    name: 'mockdata',
    component: MockDataView,
    meta: { isAuthenticated: true }
  }

];


const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if(!authStore.isLoggedIn) {
    try {
      await authStore.reissue();
    } catch (error) {
    }
  }

  if(to.meta.isAuthenticated && !authStore.isLoggedIn) {
    return next('/login');
  }

  if(to.meta.isGuestOnly && authStore.isLoggedIn) {
    return next('/');
  }

  next();
});


export default router;
