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
    meta: { isGuestOnly: true }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { isGuestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { isGuestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: setMeta(true, false),
  },
  {
    path: '/mockdata',
    component: MockDataView,
    meta: setMeta(false, false),
  },
  {
    path: '/order',
    name: 'order',
    component: OrdersView,
    meta: setMeta(true, false),
  },
  {
    path: '/menu',
    name: 'menu',
    component: MenusView,
    meta: setMeta(true, false),
  },
  {
    path: '/store',
    name: 'store',
    component: StoreView,
    meta: setMeta(true, false),
  },
  {
    path: '/platforms',
    name: 'platform',
    component: PlatformsView,
    meta: setMeta(true, false),
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