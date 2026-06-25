<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth/useAuthStore.js'; // 실제 경로에 맞게 조정 필요
import { useStoreStore } from '../../stores/store/useStoreStore.js';

const router = useRouter();
const authStore = useAuthStore();
const storeStore = useStoreStore();
// 로그인 관련 상태 관리
const isLoading = ref(false);
const showPassword = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
});

// 비밀번호 숨김/보기 토글
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 로그인 폼 제출 함수
const handleSubmit = async () => {
  if (isLoading.value) return;

  try {
    if(loginForm.email && loginForm.password) {
      isLoading.value = true;

      await authStore.login({
        email: loginForm.email,
        password: loginForm.password
      });
    /*
    * 로그인 성공 후 매장 등록 여부 확인
    */
    const myStore = await storeStore.checkMyStore(true);

    if (myStore) {
    router.push('/dashboard');
    return;
    }
    alert('신규 회원입니다. \n 매장 등록을 먼저 해야 합니다. 매장 정보를 등록한 뒤 서비스를 이용해주세요.');
    router.push('/store');

    }

  } catch (error) {
    const message = error.response?.data?.data || error.response?.data?.message || '로그인에 실패했습니다.';
    alert(message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="pos-layout">
    <main class="pos-content">
      <div class="login-card">
        <img src="/logo.png" alt="BAEF 로고" class="brand-logo" />

        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>이메일</label>
            <input
              type="email"
              v-model="loginForm.email"
              placeholder="이메일을 입력해주세요"
              required
            />
          </div>

          <div class="form-group password-group">
            <label>비밀번호</label>
            <div class="input-wrapper">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="loginForm.password"
                placeholder="비밀번호를 입력해주세요"
                required
              />
              <button type="button" class="icon-btn" @click="togglePassword" tabindex="-1">
                <svg v-if="!showPassword" viewBox="0 0 24 24" class="eye-icon">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
                <svg v-else viewBox="0 0 24 24" class="eye-icon">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            {{ isLoading ? '로그인 중...' : '로그인' }}
          </button>

          <button type="button" class="signup-btn" @click="router.push('/register')">
            회원가입
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ============================================================
   전체 배경 레이아웃 (헤더/푸터 없음)
   ============================================================ */
.pos-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #f3f4f6;
  font-family: 'Pretendard', sans-serif;
  overflow: hidden;
}

/* ============================================================
   중앙 로그인 컨텐츠 
   ============================================================ */
.pos-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background-color: #ffffff;
  padding: 50px 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-logo {
  max-width: 180px;
  height: auto;
  margin-bottom: 40px;
  object-fit: contain;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

/* 비밀번호 영역과 로그인 버튼 사이의 간격 추가 */
.password-group {
  margin-bottom: 36px; 
}

.form-group label {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.form-group input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 15px;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input::placeholder {
  color: #9ca3af;
  font-weight: 500;
}

.form-group input:focus {
  border-color: #2563EB;
  background-color: #ffffff;
}

.icon-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.eye-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ============================================================
   버튼 스타일링
   ============================================================ */
.submit-btn {
  width: 100%;
  height: 54px;
  background-color: #2563EB;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  /* 로그인 버튼과 회원가입 버튼 사이 간격 */
  margin-bottom: 16px; 
  transition: background-color 0.2s;
}

.submit-btn:hover { background-color: #1e4fbb; }
.submit-btn:disabled { background-color: #93c5fd; cursor: not-allowed; }

.signup-btn {
  width: 100%;
  height: 54px;
  background-color: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.signup-btn:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
}

/* 모바일 화면 대응 */
@media (max-width: 768px) {
  .login-card {
    padding: 40px 20px;
    box-shadow: none;
    border-radius: 0;
  }
}
</style>