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
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  background-color: #f5f7fb;
}

.sidebar-area {
  z-index: 10;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-area {
  flex: 0 0 78px;
  height: 78px;
  min-height: 78px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-area {
  flex: 1;
  min-width: 0;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 🚨 추가된 부분: no-padding 클래스가 활성화되면 패딩을 0으로 만듦 */
.page-area.no-padding {
  padding: 0;
}
</style>