import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accessToken = ref('');

  const clearAuthStore = () => {
    isLoggedIn.value = false;
    accessToken.value = '';
  }

  const login = async (loginForm) => {
    try {
      const url = '/api/login';
      const res = await myAxios.post(url, loginForm);
      const data = res.data.data;

      accessToken.value = data.accessToken;
      isLoggedIn.value = true;
    } catch (error) {
      console.error(error);
      throw error;
    } 
  }

  const reissue = async () => {
    try {
      const url = '/api/reissue-token';
      const res = await myAxios.post(url);
      const data = res.data.data;

      accessToken.value = data.accessToken;
      isLoggedIn.value = true;
    } catch (error) {
      clearAuthStore();
    }
  }

  const logout = async () => {
    try {
      const url = '/api/logout';

      const res = await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  }

  const registration = async (data) => {
    try {
      const url = "/api/registration";

      await myAxios.post(url, data);
      return;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  return {
    isLoggedIn,
    accessToken,

    login,
    reissue,
    logout,
    registration,
  }
<<<<<<< HEAD:src/stores/auth/useAuthStore.js
});
=======
});
>>>>>>> 52081c549cadf47d714d027bac6dac2f227cec04:src/store/useAuthStore.js
