<script setup>
import { reactive } from 'vue';
import MyInput from '../../components/input/MyInput.vue';
import Mybutton from '../../components/button/Mybutton.vue';


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

</script>

<template>
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