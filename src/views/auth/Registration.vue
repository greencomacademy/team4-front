<script setup>
import { reactive, ref } from 'vue';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import { useRouter } from 'vue-router';
import useAuthStore from '../../store/auth/useAuthStore.js';

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

if(registerForm.password !== registerForm.passwordChk) {
  alert('비밀번호가 서로 일치하지 않습니다.');
  return;
}
try {
  isLoading.value = true;

  await authStore.registration(registerForm);
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
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">

      <h1>회원가입</h1>
      <div class="group">
        <MyInput type="email" v-model="registerForm.email" placeholder="이메일" required></MyInput>
        <MyInput type="password" v-model="registerForm.password" placeholder="비밀번호" required></MyInput>
        <MyInput type="password" v-model="registerForm.passwordChk" placeholder="비밀번호 재확인" required></MyInput>
      </div>

    <MyButton
    :btn-type="'submit'"
    :color="'blue'"
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