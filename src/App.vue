<script setup>
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { computed, ref } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
<<<<<<< HEAD
import AppHeader from './components/layout/AppHeader.vue';

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

<<<<<<< HEAD
      <main class="page-area" :class="{ 'no-padding': isLandingPage }">
=======
      <main class="page-area">
>>>>>>> f2ffaf3 (로그인페이지와 대시보드의 분리, env파일 깃이그노어처리)
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
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f7fb;
}

.temp-header {
  height: 50px;
  background-color: #ffffff;
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
=======

const route = useRoute();
</script>

<template>
  <RouterView />
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
>>>>>>> cc26a8f (로그인 회원가입 화면)
}
</style>