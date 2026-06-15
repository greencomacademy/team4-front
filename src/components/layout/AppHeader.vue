<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/useAuthStore';


const router = useRouter();
const authStore = useAuthStore();

const redirectLogin = () => {
  router.push('/login');
}

const redirectRegistration = () => {
  router.push('/registration');
}

const logout = async () => {
  await authStore.logout();
  router.replace('/');
}
</script>

<template>
  
</template>