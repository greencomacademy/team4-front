import LandingView from '../views/landing/LandingView.vue';
import PlatformsView from '../views/platform/PlatformsView.vue';
import { useAuthStore } from '../stores/auth/useAuthStore.js';
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import Register from '../views/auth/Register.vue'
import MockDataView from '../views/mock/MockDataView.vue'
import OrdersView from '../views/order/OrdersView.vue'
import MenusView from '../views/menu/MenusView.vue'
import StoreView from '../views/store/StoreView.vue'

const setMeta = (isAuthenticated, isGestOnly) => {
  return {
    isAuthenticated,
    isGestOnly,
  }
}

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { isGuestOnly: true, hideLayout: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { isGuestOnly: true, hideLayout: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { isGuestOnly: true, hideLayout: true }
  },
  {
    path: '/store',
    name: 'store',
    component: StoreView,
    meta: { isGuestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { isGuestOnly: true },
  },
  {
    path: '/order',
    name: 'order',
    component: OrdersView,
    meta: { isGuestOnly: true },
  },
  {
    path: '/menu',
    name: 'menu',
    component: MenusView,
    meta: { isGuestOnly: true },
  },
  {
    path: '/platform',
    name: 'platform',
    component: PlatformsView,
    meta: { isGuestOnly: true },
  },
  
  {
    path: '/mockdata',
    component: MockDataView,
    meta: { isGuestOnly: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isUserAuthenticated = authStore.isLoggedIn;

  if (to.meta.isAuthenticated && !isUserAuthenticated) {
    return '/';
  }
  if (to.meta.isGuestOnly && isUserAuthenticated) {
    return '/platforms';
  }
});

export default router;