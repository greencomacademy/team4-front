import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';
// import DashboardView from '../views/DashboardView.vue';
// import PlatformsView from '../views/PlatformsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // {
    //   path: '/',
    //   name: 'landing',
    //   component: LandingView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
    // }
    {
      path: '/',
      name: 'platform',
      component: LandingView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
    }
  ]
});

export default router;
