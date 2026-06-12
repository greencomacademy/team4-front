<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';

// 🚨 파일이 아직 없으므로 아래 두 줄은 반드시 주석 처리해야 화면이 뜹니다!
// import AppHeader from './components/layout/AppHeader.vue'; 
// import BaseToast from './components/ui/BaseToast.vue'; 

const isSidebarOpen = ref(true);
</script>

<template>
  <div class="app-wrapper">
    <AppSidebar
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <header class="header-area temp-header">
        <button @click="isSidebarOpen = !isSidebarOpen">
          ☰ 메뉴 토글 임시버튼
        </button>
        <span>헤더 담당자 작업 대기 중...</span>
      </header>

      <main class="page-area">
        <!-- <RouterView /> -->
      </main>
    </div>
  </div>
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

/* 임시 헤더 디자인 */
.temp-header {
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  font-weight: bold;
  color: #dc2626; /* 임시 표시를 위해 빨간색 지정 */
}

.page-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>