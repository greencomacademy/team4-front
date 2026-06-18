import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useStoreStore = defineStore('store', () => {
  const storeInfo = ref(null);

  return {
    storeInfo,
  };
});
