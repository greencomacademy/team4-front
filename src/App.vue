<script setup>
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';
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
  <!-- 소개홈페이지, 로그인, 점포등록화면 -->
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fb;
}

.temp-header {
  height: 50px;
  background-color: #ffffff;
  height: 70px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
  flex-shrink: 0;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar-area {
  z-index: 10;
  height: 100%;
}

.page-area {
  flex: 1;
  overflow-y: auto;
}
</style>