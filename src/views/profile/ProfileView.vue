<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../../stores/auth/useAuthStore.js';

const authStore = useAuthStore();

const isLoading = ref(false);
const isSaving = ref(false);
const originalEmail = ref('');

const userInfo = reactive({
  email: '',
  storeName: '',
});

const isEmailChanged = computed(() => {
  return userInfo.email.trim() !== originalEmail.value;
});

const findMyProfile = async () => {
  try {
    isLoading.value = true;
    const profile = await authStore.fetchMyProfile();

    userInfo.email = profile?.email || '';
    userInfo.storeName = profile?.storeName || '등록된 매장 없음';
    originalEmail.value = userInfo.email;
  } catch (error) {
    alert('내 정보 조회에 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const saveEmail = async () => {
  const email = userInfo.email.trim();

  if (!email) {
    alert('이메일을 입력해 주세요.');
    return;
  }

  try {
    isSaving.value = true;
    const profile = await authStore.updateMyEmail(email);

    userInfo.email = profile?.email || email;
    userInfo.storeName = profile?.storeName || '등록된 매장 없음';
    originalEmail.value = userInfo.email;

    alert('이메일이 수정되었습니다.');
  } catch (error) {
    const message =
      error.response?.data?.data ||
      error.response?.data?.message ||
      '이메일 수정에 실패했습니다.';

    alert(message);
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await findMyProfile();
});
</script>

<template>
  <section class="page-section">
    <div class="section-title-row">
      <h1 class="main-title">내 정보</h1>
      <p class="sub-desc">1차 범위에서는 이메일과 연결 매장 정보를 백엔드에서 조회합니다.</p>
    </div>

    <article class="card">
      <div class="card-header">
        <div class="title-area">
          <h3>계정 정보</h3>
          <p class="required-note">이메일은 수정 가능하며, 연결 매장은 매장 관리에서 변경합니다.</p>
        </div>
        <div class="badge success">운영 계정</div>
      </div>

      <form class="grid-form" @submit.prevent="saveEmail">
        <div class="input-group">
          <label>이메일</label>
          <input
            v-model="userInfo.email"
            type="email"
            :disabled="isLoading || isSaving"
            placeholder="이메일을 입력하세요"
          />
        </div>
        
        <div class="input-group">
          <label>연결 매장</label>
          <input type="text" :value="userInfo.storeName" readonly />
        </div>

        <div class="info-banner full-width">
          이름, 권한, 비밀번호 변경, 회원탈퇴는 2차 기능으로 분리했습니다.
        </div>

        <div class="profile-actions full-width">
          <button
            type="button"
            class="secondary-button"
            :disabled="isLoading || isSaving"
            @click="findMyProfile"
          >
            새로고침
          </button>
          <button
            type="submit"
            class="primary-button"
            :disabled="!isEmailChanged || isLoading || isSaving"
          >
            {{ isSaving ? '저장 중...' : '이메일 저장' }}
          </button>
        </div>
      </form>
    </article>

    <article class="card second-card">
      <div class="card-header compact">
        <div class="title-area">
          <h3>2차 예정 기능</h3>
          <p class="required-note">DB 컬럼과 정책이 확정된 뒤 연결할 기능입니다.</p>
        </div>
      </div>

      <div class="future-list">
        <span>이름 관리</span>
        <span>권한 표시</span>
        <span>비밀번호 변경</span>
        <span>회원탈퇴</span>
      </div>
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

.second-card {
  margin-top: 22px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.card-header.compact {
  margin-bottom: 18px;
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
}

.grid-form input[readonly] {
  background: #f8fafc;
  cursor: default;
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

.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 6px;
}

.primary-button,
.secondary-button {
  min-height: 44px;
  padding: 0 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.primary-button {
  border: 1px solid #2784B8;
  background: #2784B8;
  color: #ffffff;
}

.secondary-button {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
}

.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.future-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.future-list span {
  padding: 10px 14px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 15px;
  font-weight: 800;
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

  .profile-actions {
    flex-direction: column;
  }
}
</style>
