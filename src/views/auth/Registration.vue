<script setup>
import { reactive } from 'vue';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import { useRouter } from 'vue-router';

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

const handleRegister = () => {
  if(registerForm.password !== registerForm.passwordChk) {
    alert('비밀번호가 서로 일치하지 않습니다.');
    return;
  }

  alert('회원가입 완료');
  router.push('/login');
}

</script>

<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">

      <h1>회원가입</h1>
      <div class="group">
        <MyInput type="email" v-model="registerForm.email" placeholder="이메일" required></MyInput>
        <MyInput type="password" v-model="registerForm.password" placeholder="비밀번호" required></MyInput>
        <MyInput type="password" v-model="registerForm.passwordChk" placeholder="비밀번호재확인" required></MyInput>

        <MyInput type="text" v-model="registerForm.ownerName" placeholder="이름" required></MyInput>
        <MyInput type="text" v-model="registerForm.phone" placeholder="연락처" required></MyInput>
        
        <MyInput type="text" v-model="registerForm.businessName" placeholder="업소명" required></MyInput>
        <MyInput type="text" v-model="registerForm.businessType" placeholder="업종" required></MyInput>
        <MyInput type="text" v-model="registerForm.businessNumber" placeholder="사업장 등록번호" required></MyInput>
      </div>

    <MyButton
    :btn-type="'submit'"
    :color="'gray'"
    :size="'small'"
    :content="'회원가입'"  
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
  gap: 10px;
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