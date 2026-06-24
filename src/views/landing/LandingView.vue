<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

// 로그인 페이지로 이동
const goToLogin = () => {
  router.push('/login');
};

// 대시보드 페이지로 이동
const goToDashboard = () => {
  router.push('/dashboard');
};
</script>

<template>
  <div class="landing-wrapper">
    
    <header class="hero-section">
      <div class="hero-container">
        
        <div class="hero-text-area">
          <h1 class="hero-title">
            매장 배달 운영의 모든 것을<br/>
            통합운영대시보드에서
          </h1>
          <p class="hero-subtitle">
            배프(BAEF)에 가입한 후 즉시 모든 기능을 이용할 수 있습니다.
          </p>
          
          <div class="hero-actions">
            <template v-if="authStore.isLoggedIn">
              <button class="btn-start" @click="goToDashboard">대시보드 시작하기</button>
            </template>
            <template v-else>
              <button class="btn-start" @click="goToLogin">셀프서비스 시작하기</button>
            </template>
          </div>
        </div>

        <div class="hero-visual-area">
          
          <div class="mockup-web">
            <div class="web-sidebar">
              <div class="skeleton-icon"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
              <div class="skeleton-line"></div>
            </div>
            <div class="web-body">
              <div class="web-header">
                <div class="skeleton-box"></div>
              </div>
              <div class="web-content">
                <div class="chart-card">
                  <div class="skeleton-title"></div>
                  <div class="bar-chart">
                    <div class="bar h-40"></div>
                    <div class="bar h-70"></div>
                    <div class="bar h-50"></div>
                    <div class="bar h-90"></div>
                    <div class="bar h-60"></div>
                    <div class="bar h-80"></div>
                  </div>
                </div>
                <div class="bottom-cards">
                  <div class="mini-card">
                    <div class="circle-chart"></div>
                  </div>
                  <div class="mini-card">
                    <div class="circle-chart secondary"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mockup-mobile">
            <div class="mobile-notch"></div>
            <div class="mobile-screen">
              <div class="mobile-header">
                <div class="hamburger"></div>
                <div class="mobile-title">배프셀프서비스</div>
              </div>
              <div class="mobile-card highlight">
                <div class="skeleton-text sm">입금 예정 금액</div>
                <div class="skeleton-text lg blue">249,180원</div>
              </div>
              <div class="mobile-card flex-row">
                <div>
                  <div class="skeleton-text sm">어제 주문금액</div>
                  <div class="skeleton-text md">1,520,180원</div>
                </div>
                <div>
                  <div class="skeleton-text sm">어제 주문수</div>
                  <div class="skeleton-text md">21건</div>
                </div>
              </div>
              <div class="mobile-card toggle-card">
                <div class="skeleton-text md">영업임시중지</div>
                <div class="toggle-btn"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>

  </div>
</template>

<style scoped>
/* ========================================
   Design System Variables
   ======================================== */
.landing-wrapper {
  --bg-main: #f4f5f7; 
  --text-main: #111111;
  --text-sub: #666666;

  width: 100%;
  min-height: 100vh;
  background-color: var(--bg-main);
  display: flex;
  flex-direction: column;
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: var(--text-main);
}

/* ========================================
   메인 히어로 영역 (화면 중앙 정렬)
   ======================================== */
.hero-section {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden; 
}

.hero-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* --- 좌측 텍스트 영역 --- */
.hero-text-area {
  flex: 1;
  max-width: 500px;
  text-align: left;
  z-index: 10;
}

.hero-title {
  font-size: 46px; 
  font-weight: 800;
  letter-spacing: -1.5px;
  line-height: 1.3;
  color: var(--text-main);
  margin-bottom: 24px;
}

.hero-subtitle {
  font-size: 17px;
  color: var(--text-sub);
  margin-bottom: 40px;
  line-height: 1.6;
}

/* 메인 시작 버튼 */
.btn-start {
  background: #3b82f6; 
  color: white;
  font-size: 18px;
  font-weight: 700;
  padding: 18px 36px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
  transition: all 0.2s ease;
}

.btn-start:hover {
  background: #2563eb;
  transform: translateY(-2px);
}

/* --- 우측 목업 시각화 영역 --- */
.hero-visual-area {
  flex: 1.2;
  position: relative;
  height: 600px;
}

/* 1. 웹 대시보드 목업 (배경) */
.mockup-web {
  position: absolute;
  top: 40px;
  right: -100px; 
  width: 800px;
  height: 500px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  display: flex;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.web-sidebar {
  width: 80px;
  background: #f8fafc;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.web-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f4f5f7;
}

.web-header {
  height: 60px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
  display: flex;
  align-items: center;
}

.web-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-card {
  background: #ffffff;
  height: 200px;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.bottom-cards {
  display: flex;
  gap: 20px;
}

.mini-card {
  flex: 1;
  background: #ffffff;
  height: 160px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 웹 CSS 디테일 (막대그래프 등) */
.bar-chart { display: flex; gap: 12px; align-items: flex-end; height: 120px; margin-top: 20px; padding-left: 20px; }
.bar { width: 30px; background: #3b82f6; border-radius: 4px 4px 0 0; }
.bar.h-40 { height: 40%; } .bar.h-70 { height: 70%; } .bar.h-50 { height: 50%; }
.bar.h-90 { height: 90%; } .bar.h-60 { height: 60%; } .bar.h-80 { height: 80%; }
.circle-chart { width: 80px; height: 80px; border-radius: 50%; border: 16px solid #3b82f6; border-top-color: #eff6ff; }
.circle-chart.secondary { border-color: #10b981; border-top-color: #ecfdf5; }

/* 2. 스마트폰 목업 (웹 목업 위에 겹침) */
.mockup-mobile {
  position: absolute;
  top: 0;
  left: 20px;
  width: 280px;
  height: 580px;
  background: #ffffff;
  border: 14px solid #1a1a1a; 
  border-radius: 40px;
  box-shadow: -15px 20px 40px rgba(0, 0, 0, 0.15); 
  z-index: 20;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.mobile-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 24px;
  background: #1a1a1a;
  border-radius: 0 0 16px 16px;
  z-index: 30;
}

.mobile-screen {
  flex: 1;
  background: #f8fafc;
  padding: 40px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 스마트폰 내부 UI CSS */
.mobile-header { display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 10px; }
.hamburger { position: absolute; left: 0; width: 20px; height: 2px; background: #111; box-shadow: 0 6px 0 #111, 0 -6px 0 #111; }
.mobile-title { font-weight: 800; font-size: 16px; }

.mobile-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.mobile-card.highlight { border: 1px solid #eff6ff; }
.mobile-card.flex-row { display: flex; justify-content: space-between; }
.mobile-card.toggle-card { display: flex; justify-content: space-between; align-items: center; }

.skeleton-text { border-radius: 4px; font-weight: 700; margin-bottom: 4px; }
.skeleton-text.sm { font-size: 12px; color: #64748b; }
.skeleton-text.md { font-size: 15px; color: #111827; }
.skeleton-text.lg { font-size: 20px; }
.skeleton-text.lg.blue { color: #3b82f6; }
.toggle-btn { width: 44px; height: 24px; background: #e2e8f0; border-radius: 12px; position: relative; }
.toggle-btn::after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

/* 스켈레톤 공통 */
.skeleton-icon { width: 24px; height: 24px; background: #cbd5e1; border-radius: 4px; }
.skeleton-line { width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; }
.skeleton-line.short { width: 60%; }
.skeleton-box { width: 200px; height: 16px; background: #e2e8f0; border-radius: 4px; }
.skeleton-title { width: 120px; height: 16px; background: #e2e8f0; border-radius: 4px; margin-bottom: 20px;}

/* ========================================
   반응형 (모바일) 처리
   ======================================== */
@media (max-width: 992px) {
  .hero-section {
    align-items: flex-start;
    padding-top: 60px;
  }
  .hero-container {
    flex-direction: column;
    text-align: center;
  }
  .hero-text-area {
    text-align: center;
    margin-bottom: 60px;
  }
  .mockup-web {
    position: relative;
    right: auto;
    width: 100%;
    max-width: 600px;
  }
  .mockup-mobile {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>