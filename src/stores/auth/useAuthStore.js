import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios.js";
import router from "../../router/index.js";

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accessToken = ref('');

  const clearAuthStore = () => {
    isLoggedIn.value = false;
    accessToken.value = '';
  }

  const login = async (loginForm) => {
    try {
      const url = '/api/auth/login';
      const res = await myAxios.post(url, loginForm);
      const data = res.data.data;

      accessToken.value = data.accessToken;
      isLoggedIn.value = true;
      router.push({ name: 'dashboard' });
    } catch (error) {
      console.error(error);
      throw error;
    } 
  }

  const reissue = async () => {
    try {
      const url = '/api/auth/reissue-token';
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
      const url = '/api/auth/logout';

      const res = await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  }

  const registration = async (data) => {
    try {
      const url = "/api/auth/register";

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
});
