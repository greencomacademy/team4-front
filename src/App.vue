<script setup>
import { ref } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';

const route = useRoute();
</script>

<template>
  <RouterView />
</template>

<style scoped>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
</style>