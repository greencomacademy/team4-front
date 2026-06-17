import LandingView from '../views/LandingView.vue';
import PlatformsView from '../views/PlatformsView.vue';
import { useAuthStore } from '../store/useAuthStore';
import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SignupView from '../views/SignupView.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { isGuestOnly: true }
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
    meta: { isAuthenticated: true }
  }
];

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