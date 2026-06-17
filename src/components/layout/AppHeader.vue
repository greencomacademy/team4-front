<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/Dashboard') // 뒤로가기 시 누르면, 대시보드 페이지로
}
</script>

<template>
  <header class="main-header">
    <div class="header-left">
      <button @click="goBack" class="btn-ghost back-btn" aria-label="대시보드로 돌아가기">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span class="back-text">돌아가기</span>
      </button>
    </div>

    <div class="header-center">
      <h1 class="header-title">헤더</h1> 
    </div>

    <div class="header-right">
      <router-link to="/profile" class="profile-link">
        <div class="avatar-circle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="profile-text">내 정보</span>
      </router-link>
    </div>
  </header>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.main-header {
  --bg-header: #ffffff;
  --border-color: #e2e8f0;
  
  --primary: #2563eb;
  --primary-light: #eff6ff;
  
  --text-main: #0f172a;
  --text-sub: #475569;
  
  --hover-bg: #f8fafc;
}

/* ========================================
헤더 전체 컨테이너 설정
======================================== */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  height: 64px;
  padding: 0 32px;
  background-color: var(--bg-header);
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
  
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  position: relative;
  z-index: 40;
}

.header-left, .header-right {
  flex: 1;
  display: flex;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  flex: 2;
  text-align: center;
}

/* ========================================
타이틀 스타일
======================================== */
.header-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.3px;
}

/* ========================================
버튼 & 링크 스타일 (Ghost Button Style)
======================================== */
.btn-ghost {
  display: inline-flex; /* flex 대신 inline-flex 사용 시 내부 아이템 정렬에 더 유리함 */
  align-items: center;
  justify-content: center;
  gap: 6px; /* 아이콘과 텍스트가 겉돌지 않게 간격을 8px -> 6px로 좁힘 */
  background: transparent;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background-color: var(--hover-bg);
  color: var(--text-main);
}

.back-icon {
  /* 아이콘 두께를 stroke-width: 2.5로 키웠으므로, 시각적 중앙을 위해 살짝 위로 올림 */
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}

.btn-ghost:hover .back-icon {
  transform: translate(-3px, -1px); /* 호버 시 위쪽 위치 유지하며 왼쪽으로 이동 */
}

/* 텍스트의 불필요한 위아래 여백을 없애고 폰트 두께감을 줌 */
.back-text {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  margin-top: 1px; /* 텍스트를 미세하게 아래로 내려 시각적 수평을 맞춤 */
}

/* ========================================
프로필 링크 영역
======================================== */
.profile-link {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-sub);
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px 6px 6px;
  border-radius: 50px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.profile-link:hover {
  background-color: var(--hover-bg);
  border-color: var(--border-color);
  color: var(--text-main);
}

.avatar-circle {
  width: 28px;
  height: 28px;
  background-color: var(--primary-light);
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle svg {
  width: 14px;
  height: 14px;
}
</style>