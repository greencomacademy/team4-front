<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import myAxios from '../../api/myAxios.js'; // 백엔드 통신을 위한 axios 추가
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import axios from 'axios';

const router = useRouter();

const registerForm = reactive({
  email: '',
  password: '',
  passwordChk: '',
  ownerName: '',
  phone: '',
  businessName: '',
  businessType: '',
  businessNumber: '',
});

// 💡 비밀번호 표시 여부를 관리하는 상태값 추가
const showPassword = ref(false);

const handleRegister = async () => {
  // 1. 유효성 검사 (비밀번호 일치 확인)
  if(registerForm.password !== registerForm.passwordChk) {
    alert('비밀번호가 서로 일치하지 않습니다.');
    return;
  }

  // 2. 백엔드 통신 (실제 API 주소로 수정해주세요)
  try {
    const response = await axios.post('http://localhost:8080/api/register', registerForm);
    
    // 성공 시 로그인 페이지로 이동
    if(response.status === 200 || response.status === 201) {
      alert('회원가입 완료');
      router.push('/login');
    }
  } catch (error) {
    console.error('회원가입 실패:', error);
    alert('회원가입 처리 중 문제가 발생했습니다.');
  }
}
</script>

<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <h1>회원가입</h1>
      
      <div class="group">
        <MyInput type="email" v-model="registerForm.email" placeholder="이메일" required></MyInput>
        
        <MyInput 
          :type="showPassword ? 'text' : 'password'" 
          v-model="registerForm.password" 
          placeholder="비밀번호" 
          required
        ></MyInput>
        
        <MyInput 
          :type="showPassword ? 'text' : 'password'" 
          v-model="registerForm.passwordChk" 
          placeholder="비밀번호재확인" 
          required
        ></MyInput>

        <label class="show-pwd-label">
          <input type="checkbox" v-model="showPassword"> 비밀번호 표시
        </label>

        <MyInput type="text" v-model="registerForm.ownerName" placeholder="이름" required></MyInput>
        <MyInput type="text" v-model="registerForm.phone" placeholder="연락처" required></MyInput>
      </div>

      <MyButton
        :btn-type="'button'"
        :color="'gray'"
        :size="'small'"
        :content="'회원가입'"  
        @click="handleRegister"
      ></MyButton>
    </form>
  </div>
</template>

<style scoped>
form {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px; /* 시각적 안정을 위해 gap을 살짝 넓혔습니다 */
}

.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 300px; /* 입력칸들이 너무 퍼지지 않게 잡아줍니다 */
}

/* 새로 추가된 비밀번호 표시 라벨 스타일 */
.show-pwd-label {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  align-self: flex-end; /* 오른쪽으로 정렬 */
  margin-bottom: 5px;
}

.login {
  font-size: 12px;
  color: #666;
  text-decoration: none;
}

.login:hover {
  color: #333;
}
</style>