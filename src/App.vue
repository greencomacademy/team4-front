<script setup>
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue'; 
import BaseToast from './components/ui/BaseToast.vue';

const isSidebarOpen = ref(true);
</script>

<template>
  <BaseToast />
  <div class="app-wrapper">
    
    <AppSidebar
      v-if="!$route.meta.hideLayout"
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <AppHeader
        v-if="!$route.meta.hideLayout"
        class="header-area" 
        @toggle-menu="isSidebarOpen = !isSidebarOpen" 
      />
      
      <main class="page-area" :class="{ 'no-padding': $route.meta.hideLayout }">
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

/* 🚨 추가된 부분: no-padding 클래스가 활성화되면 패딩을 0으로 만듦 */
.page-area.no-padding {
  padding: 0;
}
</style>