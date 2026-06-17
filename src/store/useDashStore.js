import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashStore = defineStore('dashboard', () => {
  const dashboardData = ref(null);

  return {
    dashboardData,
  };
});
