<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import loginValidator from '../../utils/validator/auth/loginValidator';
import MyInput from '../../components/input/MyInput.vue';
import MyButton from '../../components/button/MyButton.vue';
import { useAuthStore } from '../../store/useAuthStore.js';

const router = useRouter();
const authStore = useAuthStore();

const loginForm = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  if(loginForm.email && loginForm.password) {
    await authStore.login(loginForm);

    router.push('/');
  }
}

</script>

<template>
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
    :color="'gray'"
    :size="'small'"
    :content="'로그인'"
    ></MyButton>
 
    <div class="sub-link">
    <router-link to="/registration" class="register">회원가입</router-link>
    </div>
  </form>

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
  font-size: 12px;
  color: #666;
  text-decoration: none;
}

.register:hover {
  color: #333;
}

</style>