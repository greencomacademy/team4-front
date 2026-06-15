<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import loginValidator from '../../utils/validator/auth/loginValidator';
import MyInput from '../../components/input/MyInput.vue';
import Mybutton from '../../components/button/Mybutton.vue';

const router = useRouter();

const loginForm = reactive({
  email: '',
  password: '',
});

const hadleSubmit = async () => {
  const resultValidationEmail = loginValidator.email(loginForm.email);
  const resultValidationPassowrd = loginValidator.password(loginForm.password);

}

</script>

<template>
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
    
    <Mybutton
    :btnType="'submit'"
    :color="'gray'"
    :size="'small'"
    :content="'로그인'"  
    ></Mybutton>
 
    <div class="sub-link">
    <router-link to="/register" class="register">회원가입</router-link>
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