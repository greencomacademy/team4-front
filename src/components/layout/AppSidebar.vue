
<script setup>
import { ref } from 'vue';

defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['toggle']);

const navItems = [
  {
    label: '오늘 운영 대시보드',
    to: '/dashboard',
  },
  {
    label: '주문 운영 현황',
    to: '/orders',
  },
  {
    label: 'Mock 데이터',
    to: '/mockdata',
  },
  {
    label: '메뉴 수익성 설정',
    to: '/menus',
  },
  {
    label: '플랫폼 정산 조건',
    to: '/platforms',
  },
  {
    label: '매장 관리',
    to: '/store',
  },
];
</script>

<template>
    <div class="side-bar" :class="{ 'fold' : !isOpen}">
        <button class="back-btn" @click="emit('toggle')">
            {{ isOpen ? '<=' : '=>' }}
        </button>
        <div v-if="isOpen" class="side-list">
            <RouterLink 
                v-for="item in navItems" 
                :key="item.to" 
                :to="item.to" 
                class="menu-item"
            >{{ item.label }}
          </RouterLink>
        </div>
    </div>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.side-bar {
  --bg-sidebar: #ffffff;
  --border-color: #e2e8f0;
  
  --primary: #2563eb;
  --primary-light: #eff6ff;
  
  --text-main: #0f172a;
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
  font-size: 18px;
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
  right: -24px; /* 버튼의 넓이만큼 바깥으로 빼기 */
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 80px; /* 사다리꼴 모양에 맞춰 세로 길이를 늘림 */
  background-color: var(--bg-sidebar);
  
  /* 사다리꼴(Tab) 모양 자르기 */
  clip-path: polygon(0 0, 100% 15%, 100% 85%, 0 100%);
  border-radius: 0 8px 8px 0; /* clip-path 미지원 브라우저 대비 */
  
  /* clip-path 적용 시 일반 box-shadow가 잘리므로 drop-shadow 필터 사용 */
  filter: drop-shadow(3px 0 4px rgba(0, 0, 0, 0.08));
  
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
  padding-right: 2px; /* 사다리꼴 빗면에 맞춰 아이콘을 시각적 중앙으로 미세조정 */
}

.toggle-btn:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.arrow-icon {
  display: flex;
  transition: transform var(--transition-speed) ease;
}

/* 접혔을 때 화살표 방향 반전 */
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
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.menu-icon {
  font-size: 16px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.menu-item:hover .menu-icon {
  opacity: 1;
}

.router-link-active {
  background-color: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
}

.router-link-active .menu-icon {
  opacity: 1;
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