<script setup>

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