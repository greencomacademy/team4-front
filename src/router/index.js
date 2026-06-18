import LandingView from '../views/LandingView.vue';
import PlatformsView from '../views/PlatformsView.vue';
import { useAuthStore } from '../store/useAuthStore';
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/auth/Login.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import Registration from '../views/auth/Registration.vue'
import { useAuthStore } from '../store/store/useStoreStore.js'
import App from '../App.vue'
import PlatformsView from '../views/platform/PlatformsView.vue'
import MockDataView from '../views/mock/MockDataView.vue'
import LandingView from '../views/LandingView.vue'

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
    path: '/registration',
    name: 'registration',
    component: Register,
    meta: { isGuestOnly: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
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
    path: '/',
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