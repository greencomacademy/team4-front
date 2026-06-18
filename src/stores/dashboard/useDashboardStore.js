import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDashboardStore = defineStore('dashboard', () => {
  const dashboardData = ref(null);

  return {
    dashboardData,
  };
});
