<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import { useAuthStore } from '../../stores/auth/useAuthStore.js';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);

const registerForm = reactive({
  email: '',
  password: '',
  passwordChk: '',
});

const handleRegister = async () => {
  if (isLoading.value) return;

  if (registerForm.password !== registerForm.passwordChk) {
    alert('비밀번호가 서로 일치하지 않습니다.');
    return;
  }

  try {
    isLoading.value = true;
    
    // API 요청
    await authStore.registration({
      email: registerForm.email,
      password: registerForm.password,
    });
    
    alert('회원가입 완료');
    router.push('/login');
  } catch (error) {
    const message = error.response?.data?.data || error.response?.data?.message || "회원가입에 실패했습니다.";
    alert(message);
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
          이메일과 비밀번호로 계정을 만든 뒤 매장 등록과 기준정보 설정으로 이어집니다.
        </p>
      </div>

      <div class="right-panel">
        <div class="right-header">
          <span class="badge-step">1차</span>
          <h2 class="right-title">회원가입</h2>
          <p class="right-desc">점주 계정을 생성합니다.</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="input-group">
            <label class="input-label">이메일</label>
            <div class="input-wrapper">
              <MyInput
                type="email"
                placeholder="owner@deliveryinside.com"
                :required="true"
                v-model="registerForm.email"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">비밀번호</label>
            <div class="input-wrapper">
              <MyInput
                type="password"
                placeholder="영문·숫자·특수문자 8~20자"
                :required="true"
                v-model="registerForm.password"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">비밀번호 확인</label>
            <div class="input-wrapper">
              <MyInput
                type="password"
                placeholder="••••••••••••"
                :required="true"
                v-model="registerForm.passwordChk"
              />
            </div>
          </div>
          
          <div class="btn-group">
            <MyButton
              :btn-type="'submit'"
              :color="'primary'"
              :size="'large'"
              :content="isLoading ? '처리 중...' : '회원가입'"
              :disabled="isLoading"
              class="full-width-btn"
            />
          </div>
        </form>

        <div class="sub-link">
          <span class="question-text">이미 계정이 있으신가요?</span>
          <router-link to="/login" class="login-link">로그인</router-link>
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
  --panel-dark-gradient: linear-gradient(135deg, #1c2e42 0%, #2a4e73 100%);
  
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
  max-width: 1000px; /* 확장 */
  min-height: 600px; /* 확장 */
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
  padding: 80px 60px; /* 여백 확장 */
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
  font-size: 36px; /* 폰트 확장 */
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
  padding: 80px 60px; /* 여백 확장 */
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
  gap: 24px; /* 입력 폼 간격 확장 */
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
.input-wrapper :deep(input),
.input-wrapper :deep(.input-container) {
  width: 100%;
  height: 48px; /* 인풋 높이 확장 시도 */
  box-sizing: border-box;
}

/* ========================================
버튼 디자인 (사이즈 대폭 키움 시도)
======================================== */
.btn-group {
  margin-top: 16px;
}

.full-width-btn {
  width: 100%;
  display: block;
}

/* MyButton의 루트 혹은 내부 button 요소 제어 시도 */
.full-width-btn :deep(button),
.full-width-btn :deep(.btn) {
  width: 100%;
  height: 56px; 
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

.login-link {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main); 
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover {
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