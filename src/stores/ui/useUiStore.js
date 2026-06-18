import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUiStore = defineStore('ui', () => {
  const toastMessage = ref('');
  const isToastVisible = ref(false);

  return {
    toastMessage,
    isToastVisible,
  };
});
