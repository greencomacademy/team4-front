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
    path: '/auth',
    component: App
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
  routes: [
    {
      path:'/',
      name:'home',
      component:HomeView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/login',
      name:'login',
      component:LoginView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/signup',
      name:'signup',
      component:SignupView,
      meta:{
        layout: 'public',
      }
    },
    {
      path:'/dashboard',
      name:'dashboard',
      component:DashboardView,
      meta:{
        layout: 'dashboard'
      }
    }
  ]

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
