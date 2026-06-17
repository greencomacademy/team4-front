import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/auth/Login.vue';
import DashboardView from '../views/DashboardView.vue';
import Registration from '../views/auth/Registration.vue';
import { useAuthStore } from '../store/useAuthStore.js';
import App from '../App.vue';
import PlatformsView from '../views/PlatformsView.vue';
import StoreView from '../views/StoreView.vue';

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
  },
  {
    path: '/',
    name: 'platform',
    component: PlatformsView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
  },
  {
    path: '/store',
    name: 'store',
    component: StoreView // 주소가 '/store' 일 때 스토어 페이지를 띄웁니다.
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