import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';
import PlatformsView from '../views/PlatformsView.vue';
import { useAuthStore } from '../store/useAuthStore';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { isGestOnly: true }
  },
  {
    path: '/platforms',
    name: 'platform',
    component: PlatformsView,
    meta: { isAuthenticated: true }
  }
];
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
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  const isUserAuthenticated = authStore.isLoggedIn;

  if (to.meta.isAuthenticated && !isUserAuthenticated) {
    return '/';
  } 
  if (to.meta.isGestOnly && isUserAuthenticated) {
    return '/platforms';
  }
});

export default router;