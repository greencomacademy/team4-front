<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login');
};

// 회원가입 페이지로 이동
const goToRegistration = () => {
  router.push('/register');
};

const goToDashboard = () => {
  router.push('/dashboard');
};
const goTologout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<template>
  <div class="landing-wrapper">
    
      <!-- 이 영역은 필요에 따라 추가적인 콘텐츠를 넣을 수 있습니다. -->
    <nav class="landing-nav">
      <div class="logo">
        <span class="logo-icon">📊</span>
        <strong>DO</strong> PROFIT
      </div>
      <div class="nav-actions">
        <template v-if="authStore.isLoggedIn">
          <button class="btn btn-ghost" @click="goTologout">로그아웃</button>
          <button class="btn btn-primary" @click="goToDashboard">대시보드</button>
        </template>
        <template v-else>
          <button class="btn btn-ghost" @click="goToLogin">로그인</button>
          <button class="btn btn-primary" @click="goToRegistration">점포 등록하기</button>
        </template>
      </div>
    </nav>
    

    <header class="hero-section">
      <div class="hero-content">
        <span class="hero-badge">✨ B2B 배달 정산 솔루션</span>
        <h1 class="hero-title">우리 매장 배달 운영의<br/><span class="text-highlight">모든 것을 스마트하게</span></h1>
        <p class="hero-subtitle">
          수수료 부담은 줄이고, 마진과 수익은 투명하게 관리하세요.<br/>
          데이터 기반의 의사결정으로 배달 매출을 극대화할 수 있습니다.
        </p>
        <template v-if="authStore.isLoggedIn">
        <button class="btn btn-lg btn-primary shadow-glow" @click="goToDashboard">
          지금 바로 시작하기
          </button>
          </template>
          <template v-else>
        <button class="btn btn-lg btn-primary shadow-glow" @click="goToLogin">
          지금 바로 시작하기
          </button>
          </template>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="icon-right">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        
      </div>
    </header>

    <section class="features-section">
      <div class="feature-card">
        <div class="icon-wrapper primary-light">
          <span class="icon">📊</span>
        </div>
        <h3>스마트한 마진 분석</h3>
        <p>메뉴별 원가와 포장비를 계산해<br/>가장 효율적인 최적의 마진율을 찾아드립니다.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper warning-light">
          <span class="icon">⏱️</span>
        </div>
        <h3>지연 위험 알림</h3>
        <p>주방 처리량을 초과하는 주문을<br/>사전에 감지하고 위급 상황을 경고합니다.</p>
      </div>
      <div class="feature-card">
        <div class="icon-wrapper success-light">
          <span class="icon">💰</span>
        </div>
        <h3>정확한 정산 내역</h3>
        <p>플랫폼별 수수료와 배달비를<br/>정확히 공제한 진짜 순수익을 확인하세요.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.landing-wrapper {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-light: #eff6ff;
  
  --warning-light: #fffbeb;
  --success-light: #ecfdf5;
  
  --text-main: #0f172a;
  --text-sub: #475569;
  --text-muted: #94a3b8;
  
  --border-color: #e2e8f0;
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 20px rgba(37, 99, 235, 0.3);

  width: 100%;
  min-height: 100vh; /* 5000px 대신 콘텐츠에 맞춰 늘어나도록 수정 */
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
}

/* ========================================
상단 네비게이션 바
======================================== */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.logo {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.5px;
}

.logo strong {
  color: var(--primary);
}

/* 버튼 공통 스타일 */
.nav-actions { display: flex; gap: 12px; }

.btn {
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ghost {
  background: transparent;
  color: var(--text-sub);
  padding: 10px 16px;
}

.btn-ghost:hover {
  background: var(--bg-main);
  color: var(--text-main);
}

.btn-primary {
  background: var(--primary);
  color: white;
  padding: 10px 20px;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

/* ========================================
메인 히어로 영역 (Hero Section)
======================================== */
.hero-section {
  /* 부드러운 그라데이션 배경으로 깊이감 연출 */
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  padding: 100px 20px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

/* 히어로 섹션 배경 장식 요소 */
.hero-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(37,99,235,0.05) 0%, rgba(255,255,255,0) 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  background: var(--primary-light);
  color: var(--primary);
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 24px;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 24px;
  line-height: 1.2;
  color: var(--text-main);
}

.text-highlight {
  color: var(--primary);
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.25rem);
  color: var(--text-sub);
  margin-bottom: 48px;
  line-height: 1.6;
}

/* 메인 CTA 버튼 */
.btn-lg {
  font-size: 18px;
  padding: 16px 36px;
  border-radius: 50px;
  gap: 12px;
}

.shadow-glow {
  box-shadow: var(--shadow-glow);
}

.shadow-glow:hover {
  box-shadow: 0 0 25px rgba(37, 99, 235, 0.4);
  transform: translateY(-2px);
}

.icon-right {
  transition: transform 0.2s ease;
}

.btn-lg:hover .icon-right {
  transform: translateX(4px);
}

/* ========================================
하단 3단 카드 영역
======================================== */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  padding: 40px 24px 100px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  text-align: center;
  padding: 48px 32px;
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(37, 99, 235, 0.2);
}

/* 아이콘을 둥근 배경 안에 넣어 더 정돈된 느낌을 줌 */
.icon-wrapper {
  width: 72px;
  height: 72px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
}

.icon-wrapper.primary-light { background: var(--primary-light); }
.icon-wrapper.warning-light { background: var(--warning-light); }
.icon-wrapper.success-light { background: var(--success-light); }

.icon {
  font-size: 32px;
}

.feature-card h3 {
  color: var(--text-main);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  letter-spacing: -0.5px;
}

.feature-card p {
  color: var(--text-sub);
  line-height: 1.6;
  font-size: 15px;
}
</style>