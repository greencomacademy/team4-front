<script setup>
import { ref, computed } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppHeader from './components/layout/AppHeader.vue';

const route = useRoute();
const isSidebarOpen = ref(true);

// 헤더와 사이드바를 표시할지 여부
const showLayout = computed(() => !route.meta.hideLayout);
</script>

<template>
  <div class="app-wrapper" v-if="showLayout">
    <AppSidebar
      class="sidebar-area" 
      :is-open="isSidebarOpen"
      @toggle="isSidebarOpen = !isSidebarOpen" 
    />
    
    <div class="content-area">
      <AppHeader class="header-area temp-header" />

      <main class="page-area">
        <RouterView />
      </main>
    </div>
  </div>
  
  <div v-else>
    <RouterView />
  </div>
</template>

<style scoped>
/* 1. 전체 화면 크기 고정 (레이아웃 틀어짐 방지) */
.app-wrapper {
  display: flex;
  width: 100vw;
  height: 100vh; 
  overflow: hidden;
  background-color: #f5f7fb;
}

/* 2. 사이드바 영역 */
.sidebar-area {
  z-index: 10;
  height: 100%;
  flex-shrink: 0; /* 화면이 좁아져도 사이드바 너비가 강제로 찌그러지지 않도록 보호 */
}

/* 3. 우측 메인 컨텐츠 영역 (헤더 + 본문) */
.content-area {
  flex: 1; 
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 4. 헤더 영역 (중복 속성 제거 및 70px로 통일) */
.temp-header {
  height: 70px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: bold;
  flex-shrink: 0;
  box-sizing: border-box;
}

/* 5. 본문 영역 */
.page-area {
  flex: 1;
  overflow-y: auto; /* 본문 내용이 길어지면 여기에만 스크롤 생성 */
}
</style>