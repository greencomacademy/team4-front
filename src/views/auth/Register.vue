<script setup>
import { reactive } from 'vue';
<<<<<<< HEAD
import { useRouter } from 'vue-router';
import MyInput from '../../components/input/MyInput.vue';
<<<<<<< HEAD:src/views/auth/Register.vue
import Mybutton from '../../components/button/Mybutton.vue';
=======
import MyButton from '../../components/button/MyButton.vue';
>>>>>>> 880d3db (각 페이지 디자인 수정, 라우터 경로 재조정):src/views/auth/Registration.vue
=======
import MyInput from '../../components/input/MyInput.vue';
import Mybutton from '../../components/button/Mybutton.vue';
>>>>>>> cc26a8f (로그인 회원가입 화면)


const registerForm = reactive({
  businessName: '',
  businessType: '',
  businessNumber: '',
  ownerName: '',
  phone: '',
  email: '',
  password: '',
});

const handleRegister = () => {

}
<<<<<<< HEAD
</script>

<template>
<<<<<<< HEAD:src/views/auth/Register.vue
=======

</script>

<template>
>>>>>>> cc26a8f (로그인 회원가입 화면)
  <div class="register-container">
    <form @submit.prevent="hadleRegister" class="register-form">

      <h1>회원가입</h1>
      <div class="group">
        <MyInput type="text" v-model="registerForm.businessName" placeholder="업소명" required></MyInput>
        <MyInput type="text" v-model="registerForm.businessType" placeholder="업종" required></MyInput>
        <MyInput type="text" v-model="registerForm.businessNumber" placeholder="사업장 등록번호" required></MyInput>
      </div>

    <Mybutton
    :btnType="'submit'"
    :color="'gray'"
    :size="'small'"
    :content="'회원가입'"  
    ></Mybutton>
      
<<<<<<< HEAD
=======
  <div class="auth-wrapper">
    <div class="auth-card register-card">
      
      <div class="auth-header">
        <div class="logo">
          <span class="logo-icon">📊</span>
          <strong>DO</strong> PROFIT
        </div>
        <h1>회원가입</h1>
        <p>간단한 정보 입력으로 스마트한 배달 운영을 시작하세요.</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        
        <div class="form-section">
          <h3 class="section-title">계정 정보</h3>
          <div class="input-grid">
            <div class="input-wrapper full-width">
              <MyInput type="email" v-model="registerForm.email" placeholder="이메일 주소 (로그인 ID)" required />
            </div>
            <div class="input-wrapper">
              <MyInput type="password" v-model="registerForm.password" placeholder="비밀번호" required />
            </div>
            <div class="input-wrapper">
              <MyInput type="password" v-model="registerForm.passwordChk" placeholder="비밀번호 재확인" required />
            </div>
          </div>
        </div>
>>>>>>> 880d3db (각 페이지 디자인 수정, 라우터 경로 재조정):src/views/auth/Registration.vue

        <div class="btn-group">
          <MyButton
            :btn-type="'submit'"
            :color="'primary'"
            :size="'large'"
            :content="'회원가입 완료하기'"
            class="full-width-btn"
          />
        </div>

        <div class="sub-link">
          <span class="question-text">이미 계정이 있으신가요?</span>
          <router-link to="/login" class="login-link">로그인</router-link>
        </div>

      </form>
    </div>
=======


    </form>


>>>>>>> cc26a8f (로그인 회원가입 화면)
  </div>
</template>

<style scoped>
<<<<<<< HEAD
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
  padding: 40px 20px; 
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: var(--text-main);
}

/* ========================================
Auth Card Layout
======================================== */
.auth-card {
  width: 100%;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: var(--shadow-card);
  border: 1px solid rgba(226, 232, 240, 0.8);
  padding: 40px 32px;
}

/* 회원가입 폼은 2단 그리드가 넉넉히 들어가도록 넓이를 키움 (520px -> 640px) */
.register-card {
  max-width: 640px; 
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
Form Area & Grid System
======================================== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-sub);
  margin: 0 0 4px 4px;
}

/* 2단 그리드 레이아웃 적용 */
.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px; /* 입력창끼리 간격 확보 */
}

/* 특정 인풋을 가로 전체로 차지하게 만듦 */
.full-width {
  grid-column: span 2;
}

.input-wrapper {
  width: 100%;
  min-width: 0; /* 자식 요소 때문에 그리드 셀이 강제로 커지는 현상(Overflow) 방지 */
}

/* [중요] 외부 컴포넌트(MyInput)가 그리드 안에서 100% 사이즈로 딱 맞춰지도록 강제 제한 */
.input-wrapper :deep(input),
.input-wrapper :deep(div),
.input-wrapper :deep(.input-container) {
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

/* 반응형 처리: 화면이 좁을 때(태블릿/모바일) 1단으로 변경하여 깨짐 방지 */
@media (max-width: 600px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: span 1;
  }
  .register-card {
    padding: 32px 24px; /* 모바일에서는 여백을 조금 줄여줌 */
  }
}

.btn-group {
  margin-top: 8px;
}

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
  margin-top: 4px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.question-text {
  font-size: 13px;
  color: var(--text-muted);
}

.login-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: var(--primary-hover);
  text-decoration: underline;
=======
form {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.login {
  font-size: 12px;
  color: #666;
  text-decoration: none;
}

.login:hover {
  color: #333;
>>>>>>> cc26a8f (로그인 회원가입 화면)
}
</style>