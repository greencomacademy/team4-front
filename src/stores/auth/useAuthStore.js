import { defineStore } from "pinia";
import { ref } from "vue";
import myAxios from "../../api/myAxios.js";

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const accessToken = ref('');
 /*
   * Refresh Token Rotation 중복 요청 방지용
   * 새로고침 직후 여러 API가 동시에 reissue를 호출하는 문제를 막는다.
   */
  let reissuePromise = null;

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
      
      return true;
    } catch (error) {
      clearAuthStore();
      console.error(error);
      throw error;
    } 
  };

  const reissue = async () => {
     /*
     * 이미 재발급 요청이 진행 중이면
     * 새 요청을 또 보내지 않고 기존 Promise 결과를 같이 기다린다.
     */
    if (reissuePromise) {
      return reissuePromise;
    }
    reissuePromise = (async () => {
      try {
        const url = '/api/auth/reissue-token';
        const res = await myAxios.post(url);
        const data = res.data.data;
    

      accessToken.value = data.accessToken;
      isLoggedIn.value = true;

      return true;
    } catch (error) {
      clearAuthStore();
      return false;
    
    }finally {
      reissuePromise = null;}
    })();
    
    return reissuePromise;
  };

  const logout = async () => {
    try {
      const url = '/api/auth/logout';
      await myAxios.post(url);
    } catch (error) {
      console.error(error);
    } finally {
      clearAuthStore();
    }
  }

  const registration = async (data) => {
    try {
      const url = "/api/auth/register";
       /*
       * 여기 주의.
       * 붙여준 수정안에는 data가 빠져 있었는데,
       * 회원가입 요청 body가 필요하므로 반드시 data를 넣어야 한다.
       */

      await myAxios.post(url, data);
      
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return {
    isLoggedIn,
    accessToken,

    clearAuthStore,
    login,
    reissue,
    logout,
    registration,
  }
});
