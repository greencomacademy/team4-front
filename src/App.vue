<script setup>
import { computed, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';

// 🚨 파일이 아직 없으므로 아래 두 줄은 반드시 주석 처리해야 화면이 뜹니다!
// import AppHeader from './components/layout/AppHeader.vue'; 
// import BaseToast from './components/ui/BaseToast.vue'; 

const isSidebarOpen = ref(true);
const route = useRoute();
const isDashboardLayout = computed(()=>{
  return route.meta.layout === 'dashboard';
});
</script>

<template>
  <!-- 로그인 후 보여줄 대시보드화면 -->
  <div class="app-wrapper" v-if="isDashboardLayout">
    <AppSidebar
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <AppHeader v-if="!isLandingPage" class="header-area temp-header">
      </AppHeader>

      <main class="page-area">
        <RouterView />
      </main>
    </div>
  </div>
  <!-- 소개홈페이지, 로그인, 점포등록화면 -->
   <RouterView v-else/>
</template>

<style scoped>
.app-wrapper {
  display: flex; 
  height: 100vh;
  width: 100vw;
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
  padding: 0 20px;
  gap: 15px;
  font-weight: bold;
}

.page-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>