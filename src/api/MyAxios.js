import axios from "axios";
import { useAuthStore } from "../stores/auth/useAuthStore";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
   withCredentials: true,

  headers: {
    'Content-Type': 'application/json', 
  },
});

myAxios.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  const authUrl = /^\/api\/auth\/(login|register|reissue-token|logout)$/;  
  const requestUrl = config.url || '';
  const isAuthRequest = authUrl.test(requestUrl);
  
  let accessToken = authStore.accessToken;
  /*
   * 인증 관련 요청이 아니고,
   * Access Token이 메모리에 없으면
   * Refresh Token 쿠키로 복구를 시도한다.
   */
  if(!isAuthRequest && !accessToken) {
     const reissueSuccess = await authStore.reissue();

    if(reissueSuccess) {
      accessToken = authStore.accessToken;
    } 
  }
   /*
   * Access Token이 있으면 만료 5분 전 재발급한다.
   */
  if(!isAuthRequest && accessToken) {
    try {
      const claims = jwtDecode(accessToken);
      const now = dayjs().unix();
      const expTime = dayjs.unix(claims.exp).add(-5, 'minute').unix();
   
    if(now >= expTime) {
      const reissueSuccess = await authStore.reissue();
      if(reissueSuccess) {
        accessToken = authStore.accessToken;
      }
    }
  } catch (error) {
   authStore.clearAuthStore();
   accessToken = '';
  }
}
  if(!isAuthRequest && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

export default myAxios;