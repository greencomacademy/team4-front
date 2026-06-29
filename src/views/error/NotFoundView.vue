<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goDashboard = () => {
  router.push({ name: 'dashboard' });
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push('/');
};
</script>

<template>
  <section class="error-page">
    <div class="error-card">
      <p class="error-code">404</p>
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p class="error-description">
        요청하신 주소가 변경되었거나 삭제되었을 수 있습니다.<br />
        주소를 다시 확인하거나 대시보드로 이동해 주세요.
      </p>

      <div class="error-actions">
        <button type="button" class="primary-button" @click="goDashboard">
          대시보드로 이동
        </button>
        <button type="button" class="secondary-button" @click="goBack">
          이전 화면으로
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
  background: linear-gradient(135deg, #eaf8fd 0%, #f5f7fb 55%, #ffffff 100%);
}

.error-card {
  width: min(520px, 100%);
  padding: 44px 40px;
  border: 1px solid #dbeafe;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 55px rgba(15, 23, 42, 0.12);
  text-align: center;
}

.error-code {
  margin: 0 0 12px;
  color: #2784b8;
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
  background: #2784b8;
  color: #ffffff;
}

.secondary-button {
  background: #f1f5f9;
  color: #334155;
}
</style>
