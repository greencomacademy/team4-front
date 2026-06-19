<script setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue'; 
import BaseToast from './components/ui/BaseToast.vue';

const isSidebarOpen = ref(true);
</script>

<template>
  <BaseToast />
  <div class="app-wrapper">
    
    <AppSidebar
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <AppHeader
        class="header-area" 
        @toggle-menu="isSidebarOpen = !isSidebarOpen" 
      />
      <main class="page-area">
        <RouterView />
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
  background-color: #f5f7fb; /* 전체 배경색 추가 */
}

/* 사이드바 너비는 AppSidebar.vue 스스로 정하도록 둡니다 */
.sidebar-area {
  z-index: 10;
}

.content-area {
  flex: 1; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 아직 헤더 내용이 없다면 영역 구분을 위해 임시로 색을 줍니다 */
.header-area {
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.page-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>