import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import Registration from '../views/auth/Registration.vue'
import { useAuthStore } from '../store/auth/useAuthStore.js'
import App from '../App.vue'
import PlatformsView from '../views/platform/PlatformsView.vue'
import MockDataView from '../views/mock/MockDataView.vue'
import OrdersView from '../views/order/OrdersView.vue'
import LandingView from '../views/LandingView.vue'

const setMeta = (isAuthenticated, isGestOnly) => {
  return {
    isAuthenticated,
    isGestOnly,
  }
}

const routes = [
  {
    path: '/auth',
    redirect: '/login',
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
  },
  {
    path: '/mockdata',
    component: MockDataView,
    meta: setMeta(false, false),
  },
  {
    path:'/orders',
    component: OrdersView,
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


export default router;
