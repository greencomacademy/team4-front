<script setup>
import { ref } from 'vue';

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle']);

// 1. 매장 관리를 제거하고, 새로운 메뉴명(통합 주문 관리 등)을 적용했습니다.
const navItems = ref([
  { name: '통합 대시보드', path: '/dashboard' },
  { name: '통합 주문 관리', path: '/order' },
  { name: '메뉴 수익 관리', path: '/menu' },
  { name: '수수료 기준 설정', path: '/platform' },
  { name: 'Mock 데이터', path: '/mockdata' }
  // 매장 관리는 헤더로 이동했으므로 삭제
]);
</script>

<template>
  <aside class="side-bar" :class="{ 'fold': !isOpen }">
    <button class="toggle-btn" @click="emit('toggle')" aria-label="사이드바 토글">
      <span class="arrow-icon" :class="{ 'rotated': !isOpen }">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </span>
    </button>
    
    <div class="sidebar-content" :class="{ 'hidden': !isOpen }">
      <div class="logo-area">
        <span class="logo-text">DO <strong>PROFIT</strong></span>
      </div>

      <nav class="side-list">
        <router-link
          class="menu-item"
          v-for="(item, index) in navItems" 
          :key="index"
          :to="item.path"
        >
          <span class="menu-name">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.side-bar {
  --bg-sidebar: #ffffff;
  --border-color: #e2e8f0;
  
  --primary: #2784B8; /* 최신 가이드라인에 맞춰 수정 (Primary Strong) */
  --primary-light: #EAF8FD; /* 최신 가이드라인에 맞춰 수정 (Primary Soft) */
  
  --text-main: #164E68; /* 최신 가이드라인에 맞춰 수정 (Primary Text) */
  --text-sub: #475569;
  --text-muted: #94a3b8;
  
  --hover-bg: #f8fafc;
  
  --sidebar-width: 240px;
  --transition-speed: 0.3s;
}

/* ========================================
1. 사이드바 전체 프레임
======================================== */
/* ========================================
Design System Variables
======================================== */
.side-bar {
  --bg-sidebar: #ffffff;
  --border-color: #e2e8f0;
  
  --primary: #2784B8; /* 최신 가이드라인에 맞춰 수정 (Primary Strong) */
  --primary-light: #EAF8FD; /* 최신 가이드라인에 맞춰 수정 (Primary Soft) */
  
  --text-main: #164E68; /* 최신 가이드라인에 맞춰 수정 (Primary Text) */
  --text-sub: #475569;
  --text-muted: #94a3b8;
  
  --hover-bg: #f8fafc;
  
  --sidebar-width: 240px;
  --transition-speed: 0.3s;
}

/* ========================================
1. 사이드바 전체 프레임
======================================== */
.side-bar {
  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
  
  transition: width var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible; 
  height: 100vh;
  width: var(--sidebar-width);
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  box-sizing: border-box;
  flex-shrink: 0;
  position: relative;
  z-index: 50;
  
  transition: width var(--transition-speed) cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible; 
}

.side-bar.fold {
  width: 0px; 
}

/* ========================================
2. 사이드바 내부 컨텐츠 영역
======================================== */
.sidebar-content {
  width: var(--sidebar-width);
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow-y: auto;
  overflow-x: hidden;
  transition: opacity 0.2s ease;
}

.sidebar-content.hidden {
  opacity: 0;
  pointer-events: none;
}

.logo-area {
  padding: 28px 24px 20px;
  margin-bottom: 8px;
}
.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.5px;
}
.logo-text strong {
  color: var(--primary);
}

.side-list {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ========================================
3. 바깥으로 튀어나오는 토글 버튼 (사다리꼴 형태)
======================================== */
.toggle-btn {
  position: absolute;
  right: -24px; 
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 80px; 
  background-color: var(--bg-sidebar);
  
  clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%);
  border-radius: 0 8px 8px 0; 
  filter: drop-shadow(3px 0 4px rgba(0, 0, 0, 0.08));
  
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
  padding-right: 2px; 
}

.toggle-btn:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.arrow-icon {
  display: flex;
  transition: transform var(--transition-speed) ease;
}

.arrow-icon.rotated {
  transform: rotate(180deg);
}

/* ========================================
4. 메뉴 아이템 스타일
======================================== */
.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none; 
  padding: 12px 14px;
  color: var(--text-sub); 
  cursor: pointer;
  font-size: 19px; /* 메뉴 글씨가 19px면 너무 큽니다. 일반적인 15~16px로 조정했습니다 */
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.router-link-active {
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 800;
}

.router-link-active::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 4px;
  background-color: var(--primary);
  border-radius: 0 4px 4px 0;
}
</style>