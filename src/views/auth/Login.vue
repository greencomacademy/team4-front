<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';

import { useAuthStore } from '../../stores/auth/useAuthStore.js';

const router = useRouter();
const authStore = useAuthStore();

// 로그인 요청 중 중복 클릭을 방지하기 위한 로딩 상태 관리
const isLoading = ref(false);

// 입력한 이메일 비밀번호를 저장
const loginForm = reactive({
  email: '',
  password: '',
});

// 로그인 폼 제출 함수
const handleSubmit = async () => {
// 이미 로그인 요청 진행 중인 경우 추가 요청 차단
if (isLoading.value) return;

  try {
    // 이메일 비밀번호 모두 입력됐을 때만 로그인 성공
    if(loginForm.email && loginForm.password) {
      isLoading.value = true; 

      // 스토어의 로그인 액션 호출
      await authStore.login(loginForm);
       /*
       * 스토어는 인증 상태만 관리하고,
       * 화면 이동은 Login.vue에서 처리한다.
       */
      router.push({ name: 'dashboard' });
      
      // 로그인 성공시 메인 페이지로 페이지 이동
      router.push('/dashboard');
    }
  } catch (error) {
      const message = error.response?.data?.data || error.response?.data?.message || '로그인에 실패했습니다.';

      alert(message);
      return;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="split-card">
      
      <div class="left-panel">
        <div class="badge-di">DI</div>
        <h1 class="left-title">
          매장 운영 기준을<br/>
          설정하고<br/>
          바로 시작하세요.
        </h1>
        <p class="left-desc">
          이메일과 비밀번호로 계정을 만든 뒤 매장 등록과 기준정보 설정으로<br/>
          이어집니다.
        </p>
      </div>

      <div class="right-panel">
        <div class="right-header">
          <span class="badge-step">1차</span>
          <h2 class="right-title">로그인</h2>
          <p class="right-desc">등록한 점주 계정으로 접속합니다.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="input-group">
            <label class="input-label">이메일</label>
            <div class="input-wrapper">
              <MyInput
                :type="'email'"
                :placeholder="'owner@deliveryinside.com'"
                :readonly="false"
                :required="true"
                v-model="loginForm.email"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">비밀번호</label>
            <div class="input-wrapper">
              <MyInput
                :type="'password'"
                :placeholder="'••••••••••••'"
                :readonly="false"
                :required="true"
                v-model="loginForm.password"
              />
            </div>
          </div>
          
          <div class="btn-group">
            <MyButton
              :btn-type="'submit'"
              :color="'primary'"
              :size="'large'"
              :content="isLoading ? '로그인 중...' : '로그인'"
              class="full-width-btn"
            />
          </div>
        </form>

        <div class="sub-link">
          <span class="question-text">계정이 없으신가요?</span>
          <router-link to="/register" class="register">회원가입</router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.auth-wrapper {
  --bg-main: #f4f6fc;
  
  --panel-dark: #20354b;
  /* 우측 하단으로 갈수록 #87CEEB로 은은하게 밝아지는 그라데이션 */
  --panel-dark-gradient: linear-gradient(150deg, #1c2e42 30%, #2a4e73 70%, #87ceeb 110%);
  
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  
  --text-main: #111827;
  --text-sub: #6b7280;
  
  --shadow-card: 0 20px 40px -10px rgba(0, 0, 0, 0.1);

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main);
  padding: 20px;
  font-family: 'Pretendard', -apple-system, sans-serif;
}

/* ========================================
Split Card Layout (스플릿 레이아웃 크기 확장)
======================================== */
.split-card {
  display: flex;
  width: 100%;
  max-width: 1000px; /* 기존 900px에서 1000px로 확장 */
  min-height: 600px; /* 기존 540px에서 600px로 확장 */
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden; 
  box-shadow: var(--shadow-card);
}

/* ========================================
Left Panel 
======================================== */
.left-panel {
  flex: 1.1; 
  background: var(--panel-dark-gradient);
  padding: 80px 60px; /* 카드 크기에 맞춰 여백도 늘림 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.badge-di {
  width: 48px;
  height: 48px;
  background-color: #4a77a4; 
  color: #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  margin-bottom: 40px;
}

.left-title {
  color: #ffffff;
  font-size: 36px; /* 글자 크기 살짝 키움 */
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: -1px;
  margin-bottom: 24px;
}

.left-desc {
  color: #a5b9ce; 
  font-size: 16px;
  line-height: 1.6;
  word-break: keep-all;
}

/* ========================================
Right Panel 
======================================== */
.right-panel {
  flex: 1;
  padding: 80px 60px; /* 카드 크기에 맞춰 여백도 늘림 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-header {
  margin-bottom: 36px;
}

.badge-step {
  display: inline-block;
  background-color: #eff6ff;
  color: var(--primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 800;
  margin-bottom: 12px;
}

.right-title {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.right-desc {
  font-size: 14px;
  color: var(--text-sub);
}

/* ========================================
Form Elements
======================================== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px; /* 요소 간격 넓힘 */
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 700;
  color: #4b5563;
}

.input-wrapper {
  width: 100%;
}

/* 폼 높이도 버튼 비율에 맞춰 살짝 키워줍니다 */
.input-wrapper :deep(input),
.input-wrapper :deep(.input-container) {
  width: 100%;
  height: 48px; /* 입력창 높이 지정 */
  box-sizing: border-box;
}

/* ========================================
버튼 디자인 (사이즈 대폭 키움)
======================================== */
.btn-group {
  margin-top: 16px; /* 버튼 위쪽 간격 확보 */
}

.full-width-btn {
  width: 100%;
  display: block;
}

.full-width-btn :deep(button) {
  width: 100%;
  height: 56px; /* 버튼 높이 대폭 확장 */
  font-size: 16px; 
  font-weight: 700;
  border-radius: 8px; 
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

/* ========================================
Sub Link Area
======================================== */
.sub-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 28px;
}

.question-text {
  font-size: 14px;
  color: var(--text-sub);
  font-weight: 500;
}

.register {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main); 
  text-decoration: none;
  transition: color 0.2s ease;
}

.register:hover {
  color: var(--primary);
  text-decoration: underline;
}

/* ========================================
반응형 (모바일) 처리
======================================== */
@media (max-width: 768px) {
  .split-card {
    flex-direction: column;
    min-height: auto;
  }
  
  .left-panel {
    padding: 50px 30px;
    flex: none;
  }

  .right-panel {
    padding: 50px 30px;
  }
}
</style>