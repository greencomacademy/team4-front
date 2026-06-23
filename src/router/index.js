import {
  createRouter,
  createWebHistory,
} from 'vue-router';

import { useAuthStore } from '../stores/auth/useAuthStore.js';

import LandingView from '../views/landing/LandingView.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

import DashboardView from '../views/dashboard/DashboardView.vue';
import MenusView from '../views/menu/MenusView.vue';
import PlatformsView from '../views/platform/PlatformsView.vue';
import StoreView from '../views/store/StoreView.vue';
import MockDataView from '../views/mock/MockDataView.vue';
import OrdersView from '../views/order/OrdersView.vue';

/*
 * 라우트마다 사용할 meta 정보를 생성한다.
 *
 * isAuthenticated
 * → 로그인이 필요한 화면인지 표시
 *
 * isGuestOnly
 * → 로그인하지 않은 사용자만 접근 가능한 화면인지 표시
 */
const setMeta = (
  isAuthenticated = false,
  isGuestOnly = false
) => {
  return {
    isAuthenticated,
    isGuestOnly,
  };
};

const routes = [
  /*
   * 로그인 전 메인 랜딩 페이지
   */
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { isGuestOnly: true, hideLayout: true }
  },

  /*
   * 로그인 화면
   */
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { isGuestOnly: true, hideLayout: true }
  },

  /*
   * 회원가입 화면
   */
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
    meta: { isAuthenticated: true },
  },

  /*
   * 오늘 운영 대시보드
   */
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { isAuthenticated: true },
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView,
    meta: { isAuthenticated: true },
  },

  /*
   * 메뉴 수익성 설정
   */
  {
    path: '/menus',
    name: 'menus',
    component: MenusView,
    meta: { isAuthenticated: true },
  },

  /*
   * 발표·테스트용 Mock 데이터 화면
   */
  {
    path: '/platform',
    name: 'platform',
    component: PlatformsView,
    meta: { isAuthenticated: true },
  },
  {
    path: '/mockdata',
    name: 'mockdata',
    component: MockDataView,
    meta: { isAuthenticated: true },
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/*
 * 화면 이동 전에 실행되는 네비게이션 가드
 */
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  /*
   * 로그인이 필요한 화면인데 Access Token이 없다면
   * Refresh Token 쿠키로 로그인 상태 복구를 먼저 시도한다.
   */
  if (
    to.meta.isAuthenticated &&
    !authStore.accessToken
  ) {
    const reissueSuccess = await authStore.reissue();

    if (!reissueSuccess) {
      return {
        name: 'login',
      };
    }
  }

  /*
   * 복구 후에도 로그인 상태가 아니면 로그인 화면으로 보낸다.
   */
  if (
    to.meta.isAuthenticated &&
    !authStore.isLoggedIn
  ) {
    return {
      name: 'login',
    };
  }

  /*
   * 로그인한 사용자가 랜딩/로그인/회원가입으로 가려고 하면
   * Refresh Token으로 복구 후 dashboard로 보낸다.
   */
  if (
    to.meta.isGuestOnly &&
    !authStore.accessToken
  ) {
    const reissueSuccess = await authStore.reissue();

    if (reissueSuccess) {
      return {
        name: 'dashboard',
      };
    }
  }

  if (
    to.meta.isGuestOnly &&
    authStore.isLoggedIn
  ) {
    return {
      name: 'dashboard',
    };
  }

  return true;
});

export default router;
