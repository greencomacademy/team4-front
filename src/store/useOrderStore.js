import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOrderStore = defineStore('order', () => {
  const orderList = ref([]);

  return {
    orderList,
  };
});
