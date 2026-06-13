<template>
  <div class="landing-wrapper">
    <nav class="landing-nav">
      <div class="logo">배달 운영 정산 대시보드</div>
      <button class="login-btn" @click="goToAuth">로그인</button>
    </nav>

    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">우리 매장 배달 운영의 모든 것</h1>
        <p class="hero-subtitle">수수료 부담은 줄이고, 수익은 스마트하게 관리하세요.</p>
        <button class="btn-start" @click="goToAuth">
          지금 바로 시작하기
        </button>
      </div>
    </header>

    <section class="features-section">
      <div class="feature-card">
        <div class="icon">📊</div>
        <h3>스마트한 마진 분석</h3>
        <p>메뉴별 원가와 포장비를 계산해 최적의 마진율을 찾아드립니다.</p>
      </div>
      <div class="feature-card">
        <div class="icon">⏱️</div>
        <h3>지연 위험 알림</h3>
        <p>주방 처리량을 초과하는 주문을 사전에 감지하고 경고합니다.</p>
      </div>
      <div class="feature-card">
        <div class="icon">💰</div>
        <h3>정확한 정산 내역</h3>
        <p>플랫폼별 수수료와 배달비를 공제한 진짜 순수익을 확인하세요.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// 로그인/회원가입 페이지로 이동하는 함수
const goToAuth = () => {
  router.push('/auth');
};
</script>

<style scoped>
/* 전체 배경을 흰색으로 덮기 */
.landing-wrapper {
  width: 100%;
  height: 5000px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 상단 네비게이션 바 */
.landing-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: #ffffff;
}

.logo {
  font-size: 1.2rem;
  font-weight: 900;
  color: #000000;
}

.login-btn {
  background: transparent;
  color: #333;
  font-weight: bold;
  padding: 8px 20px;
  border-radius: 20px;
  border: 3px solid #000000;
}

.login-btn:hover {
  background-color: #f9fafc;
}

/* 메인 청록색 배너 영역 */
.hero-section {
  background-color: #87CEEB;
  height: 350px;
  color: #000000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 8% 20px;
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 300;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  margin-bottom: 40px;
  opacity: 0.9;
}

.btn-start {
  background-color: white;
  color: #000000;
  font-size: 25px;
  font-weight: 900;
  padding: 20px 50px;
  border-radius: 50px;
  box-shadow: 0 8px 20px rgba(0, 199, 174, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 199, 174, 0.4);
}

/* 하단 3단 카드 영역 */
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 3px solid #000000;
}

.icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  color: #000000;
  font-size: 25px;
  margin-bottom: 12px;
}

.feature-card p {
  color: #999999;
  line-height: 1.6;
}
</style>