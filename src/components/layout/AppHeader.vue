<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

// 드롭다운 열림/닫힘 상태 및 DOM 요소를 참조하기 위한 변수
const isMenuOpen = ref(false)
const dropdownContainer = ref(null)

// 햄버거 메뉴 토글 함수
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 드롭다운 외부 영역 클릭 시 닫히도록 처리하는 함수
const closeMenu = (e) => {
  if (isMenuOpen.value && dropdownContainer.value && !dropdownContainer.value.contains(e.target)) {
    isMenuOpen.value = false
  }
}

// 컴포넌트가 화면에 마운트될 때 클릭 이벤트 리스너 등록
onMounted(() => {
  document.addEventListener('click', closeMenu)
})

// 컴포넌트가 파괴될 때 메모리 누수 방지를 위해 리스너 해제
onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})

const goBack = () => {
  router.push('/dashboard'); 
}

const logout = async () => {
  await authStore.logout();
  router.replace('/');
}
</script>

<template>
  <header class="main-header">
    
    <div class="header-left">
      <button @click="goBack" class="btn-ghost back-btn" aria-label="뒤로가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="back-text">뒤로가기</span>
      </button>
    </div>

    <div class="header-center">
      <h1 class="header-title">헤더</h1>
    </div>

    <div class="header-right" ref="dropdownContainer">
      <button @click="toggleMenu" class="hamburger-btn" aria-label="메뉴 열기">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div v-if="isMenuOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <span class="user-info">테스트 점주 / owner@test.com</span>
          <span class="status-badge">운영 계정 연결됨</span>
        </div>
        
        <div class="dropdown-actions">
          <button class="action-btn btn-white" @click="router.push('/profile'); isMenuOpen = false;">내 정보</button>
          <button class="action-btn btn-white" @click="router.push('/store'); isMenuOpen = false;">매장 관리</button>
          <button class="action-btn btn-blue" @click="router.go(0)">전체 새로고침</button>
          <button class="action-btn btn-red" @click="logout">로그아웃</button>
        </div>
      </div>
    </div>
    
  </header>
</template>

<style scoped>
/* ========================================
   디자인 시스템 변수 정의 
   ======================================== */
.main-header {
  --bg-header: #ffffff;
  --border-color: #e2e8f0;
  
  /* 브랜드 가이드라인 적용 */
  --primary: #2784B8; 
  --primary-light: #EAF8FD; 
  
  --text-main: #164E68; 
  --text-sub: #475569;
  --hover-bg: #f8fafc;

  display: flex;
  justify-content: space-between; 
  align-items: center; 
  
  width: 100%;
  height: 100%;
  padding: 0 24px;
  background-color: var(--bg-header);
  box-sizing: border-box;
}

/* ========================================
   세 영역 공간 균등 배분 기법
   ======================================== */
.header-left, .header-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
  position: relative; 
}

.header-center {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* 타이틀 스타일 */
.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

/* ========================================
   뒤로가기 버튼 스타일
   ======================================== */
.btn-ghost {
  display: inline-flex; 
  align-items: center;
  justify-content: center;
  gap: 8px; 
  background: transparent;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.back-icon {
  transition: transform 0.2s ease;
}

.btn-ghost:hover .back-icon {
  transform: translateX(-3px); 
}

.back-text {
  font-size: 14px;
  font-weight: 700;
}

/* ========================================
   햄버거 버튼 & 드롭다운 스타일
   ======================================== */

/* 햄버거 버튼 */
.hamburger-btn {
  background: transparent;
  border: none;
  color: #64748b; 
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
}

.hamburger-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

/* 드롭다운 메뉴 컨테이너 */
.dropdown-menu {
  position: absolute;
  top: 50px; 
  right: 0;
  width: 360px; 
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); 
  padding: 16px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 드롭다운 상단 정보 */
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.user-info {
  font-weight: 800;
  font-size: 14px;
  color: #111827;
}

.status-badge {
  background-color: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
}

/* 액션 버튼 그룹 (2x2 그리드로 변경됨) */
.dropdown-actions {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2열 배치 */
  gap: 8px;
}

.action-btn {
  width: 100%;
  padding: 10px 0;
  border-radius: 6px;
  font-weight: 800;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  opacity: 0.85;
  transform: translateY(-1px);
}

/* 개별 버튼 컬러링 */
.btn-white {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
}

.btn-blue {
  background-color: #2784B8; 
  border: none;
  color: #ffffff;
}

.btn-red {
  background-color: #DC2626; 
  border: none;
  color: #ffffff;
}
</style>
