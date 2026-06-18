<script setup>
import { ref, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';

// 🚨 파일이 아직 없으므로 아래 두 줄은 반드시 주석 처리해야 화면이 뜹니다!
// import AppHeader from './components/layout/AppHeader.vue'; 
// import BaseToast from './components/ui/BaseToast.vue'; 

const route = useRoute();
const isSidebarOpen = ref(true);

// 현재 주소가 '/' (랜딩 페이지)인지 감지하는 변수
const isLandingPage = computed(() => route.path === '/');
</script>

<template>
  <div class="app-wrapper">
    <AppSidebar
      v-if="!isLandingPage"
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <AppHeader v-if="!isLandingPage" class="header-area temp-header">
      </AppHeader>

      <main class="page-area" :class="{ 'no-padding': isLandingPage }">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex; 
  overflow: hidden;
  background-color: #f5f7fb; 
}

.sidebar-area {
  z-index: 10;
}

.content-area {
  flex: 1; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 양쪽 브랜치에서 각각 추가한 높이와 배경색 속성을 모두 누락 없이 합쳤습니다 */
.temp-header {
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
}
</style>