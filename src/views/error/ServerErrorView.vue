<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const retry = () => {
  window.location.reload();
};

const goDashboard = () => {
  router.push({ name: 'dashboard' });
};
</script>

<template>
  <section class="error-page">
    <div class="error-card server-error-card">
      <p class="error-code">500</p>
      <h1>일시적인 오류가 발생했습니다.</h1>
      <p class="error-description">
        서버 연결이 불안정하거나 요청 처리 중 문제가 발생했습니다.<br />
        잠시 후 다시 시도해 주세요.
      </p>

      <div class="error-help-box">
        <strong>확인해 주세요</strong>
        <span>백엔드 서버가 실행 중인지, 로그인 상태가 유지되고 있는지 확인하면 됩니다.</span>
      </div>

      <div class="error-actions">
        <button type="button" class="primary-button" @click="retry">
          다시 시도
        </button>
        <button type="button" class="secondary-button" @click="goDashboard">
          대시보드로 이동
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(135deg, #fff7ed 0%, #f5f7fb 55%, #ffffff 100%);
}

.error-card {
  width: min(560px, 100%);
  padding: 44px 40px;
  border: 1px solid #fed7aa;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.12);
  text-align: center;
}

.error-code {
  margin: 0 0 12px;
  color: #87CEEB;
  font-size: 48px;
  font-weight: 800;
  letter-spacing: -1px;
}

.error-card h1 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
}

.error-description {
  margin: 0;
  color: #64748b;
  font-size: 15px;
  line-height: 1.7;
}

.error-help-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: 16px;
  background: #fff7ed;
  color: #9a3412;
  font-size: 14px;
  text-align: left;
}

.error-help-box strong {
  color: #7c2d12;
  font-size: 14px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
  flex-wrap: wrap;
}

.error-actions button {
  min-width: 140px;
  padding: 12px 18px;
  border-radius: 14px;
  border: 0;
  cursor: pointer;
  font-weight: 700;
}

.primary-button {
  background: #87CEEB;
  color: #ffffff;
}

.secondary-button {
  background: #f1f5f9;
  color: #334155;
}
</style>
