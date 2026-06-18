import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../api/MyAxios";

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accessToken = ref('');

  const clearAuthStore = () => {
    isLoggedIn.value = false;
    accessToken.value = '';
  }

  const login = async (loginForm) => {
    try {
      const url = '/auth/login';
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
      const url = '/auth/reissue-token';
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
      const url = '/auth/logout';

      const res = await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  }

  const registration = async (data) => {
    try {
      const url = "/auth/signup";

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

export default useAuthStore;