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

  <form @submit.prevent="handleSubmit">
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
form {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.register {
  font-size: 14px;
  color: #666;
  text-decoration: none;
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

</style>