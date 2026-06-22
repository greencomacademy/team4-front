import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import Registration from '../views/auth/Register.vue'
import { useAuthStore } from '../stores/auth/useAuthStore.js'
import App from '../App.vue'
import PlatformsView from '../views/platform/PlatformsView.vue'
import MockDataView from '../views/mock/MockDataView.vue'
import OrdersView from '../views/order/OrdersView.vue'
import MenusView from '../views/menu/MenusView.vue'
import StoreView from '../views/store/StoreView.vue'
import LandingView from '../views/landing/LandingView.vue'
import Register from '../views/auth/Register.vue'

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
    component: LandingView, // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
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
    path: '/mockdata',
    component: MockDataView,
    meta: setMeta(false, false),
  },
  {
    path: '/platform',
    name: 'platform',
    component: PlatformsView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
    },
    {
    path: '/',
    name: 'landing',
    component: LandingView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
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