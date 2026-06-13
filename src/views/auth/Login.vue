<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import { useAuthStore } from '../../store/useAuthStore.js';

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
      
      // 로그인 성공시 메인 페이지로 페이지 이동
      router.push('/');
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
<div class="login-wrap">
  <form @submit.prevent="hadleSubmit">
    <h1>로그인</h1>
    <div class="group">
    <MyInput
      :type="'email'"
      :placeholder="'Email'"
      :readonly="false"
      :required="true"
      v-model="loginForm.email"
    ></MyInput>

    <MyInput
      :type="'password'"
      :placeholder="'Password'"
      :readonly="false"
      :required="true"
      v-model="loginForm.password"
    ></MyInput>
    </div>
    
    <MyButton
    :btn-type="'submit'"
    :color="'blue'"
    :size="'small'"
    :content="'로그인'"
    ></MyButton>

  </form>

  <div class="sub-link">
  <router-link to="/registration" class="register">회원가입</router-link>
  </div>
</div>

</template>

<style scoped>
/* ========================================
Design System Variables
======================================== */
.auth-wrapper {
  --bg-main: #f8fafc;
  --bg-card: #ffffff;
  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --text-main: #0f172a;
  --text-sub: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-card: 0 10px 25px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025);

  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main);
  padding: 20px;
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: var(--text-main);
}

/* ========================================
Auth Card Layout
======================================== */
.auth-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 40px 32px;
}

/* ========================================
Header Area
======================================== */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-main);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.logo strong {
  color: var(--primary);
}

.auth-header h1 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  color: var(--text-main);
  letter-spacing: -0.5px;
}

.auth-header p {
  font-size: 14px;
  color: var(--text-sub);
  margin: 0;
}

/* ========================================
Form Area
======================================== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* MyInput이 꽉 차게 렌더링되도록 도와주는 래퍼 */
.input-wrapper {
  width: 100%;
}

.btn-group {
  margin-top: 8px;
}

/* MyButton에 width 100%를 강제 적용하기 위한 클래스 (해당 컴포넌트 구조에 따라 다를 수 있음) */
.full-width-btn {
  width: 100%;
  display: block;
}

/* ========================================
Sub Link Area
======================================== */
.sub-link {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.question-text {
  font-size: 13px;
  color: var(--text-muted);
}

.register {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s ease;
}

.sub-link {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.register:hover {
  color: #ff1acd;
  text-decoration: underline;
}

form {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.register {
  font-size: 12px;
  color: #666;
  text-decoration: none;
}

.register:hover {
  color: #333;
}

</style>