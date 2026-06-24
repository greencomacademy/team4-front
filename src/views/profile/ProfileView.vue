<script setup>
import { reactive } from 'vue';

// UI 확인용 더미 데이터 (실제 구현 시 API 연동 또는 Pinia authStore 등에서 가져옵니다)
const userInfo = reactive({
  name: '테스트 점주',
  email: 'owner@test.com',
  storeName: 'DeliveryInsider Kitchen',
  role: 'OWNER'
});
</script>

<template>
  <section class="page-section">
    <div class="section-title-row">
      <h1 class="main-title">내 정보</h1>
      <p class="sub-desc">헤더의 내 정보 버튼에서 진입하는 화면입니다.</p>
    </div>

    <article class="card">
      <div class="card-header">
        <div class="title-area">
          <h3>계정 정보</h3>
          <p class="required-note">UI 확인용 더미 데이터</p>
        </div>
        <div class="badge success">운영 계정</div>
      </div>

      <form class="grid-form" @submit.prevent>
        <div class="input-group">
          <label>이름</label>
          <input type="text" :value="userInfo.name" readonly />
        </div>
        
        <div class="input-group">
          <label>이메일</label>
          <input type="text" :value="userInfo.email" readonly />
        </div>
        
        <div class="input-group">
          <label>연결 매장</label>
          <input type="text" :value="userInfo.storeName" readonly />
        </div>
        
        <div class="input-group">
          <label>권한</label>
          <input type="text" :value="userInfo.role" readonly />
        </div>

        <div class="info-banner full-width">
          실제 구현 시 회원 정보 조회 API와 연결하면 됩니다.
        </div>
      </form>
    </article>
  </section>
</template>

<style scoped>
/* =======================================
   전체 레이아웃 및 폰트 시스템
======================================= */
.page-section {
  max-width: 100%;
  margin: 0 auto;
  padding: 40px 30px;
  color: #374151;
  font-family: 'Pretendard', sans-serif;
  min-height: calc(100vh - 78px);
  background-color: #f4f6fc;
  box-sizing: border-box;
}

.main-title {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.sub-desc {
  font-size: 16px;
  color: #6b7280;
  margin-bottom: 30px;
}

/* =======================================
   카드 (Card)
======================================= */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 32px 40px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.title-area h3 {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}

.required-note {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* 상태 뱃지 */
.badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 800;
}

.badge.success {
  background-color: #d1fae5;
  color: #059669; 
}

/* =======================================
   그리드 폼 및 인풋
======================================= */
.grid-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.full-width {
  grid-column: span 2; 
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 15px;
  font-weight: 800;
  color: #374151;
}

.grid-form input {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  font-size: 16px;
  color: #111827;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  cursor: default; /* readonly 요소이므로 커서 변경 */
}

.grid-form input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* =======================================
   정보 배너
======================================= */
.info-banner {
  background-color: #f0fdfa; 
  border: 1px solid #ccfbf1;
  color: #0f766e;
  padding: 16px 20px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  margin-top: 10px;
}

/* =======================================
   반응형 (Mobile)
======================================= */
@media (max-width: 768px) {
  .page-section { 
    padding: 20px 16px; 
  }
  
  .card { 
    padding: 24px 20px; 
  }
  
  .grid-form { 
    grid-template-columns: 1fr; 
  }
  
  .full-width { 
    grid-column: span 1; 
  }
}
</style>