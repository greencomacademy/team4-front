import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView // 주소가 '/' 일 때 랜딩 페이지를 띄웁니다.
    }
  ]
});

export default router;