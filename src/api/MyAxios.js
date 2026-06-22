import axios from "axios";
import { useAuthStore } from "../stores/auth/useAuthStore";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";

const myAxios = axios.create({
  baseURL: 'http://localhost:8080',

  headers: {
    'Content-Type': 'application/json', 
  },

  withCredentials: true,
});

myAxios.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  let accessToken = authStore.accessToken;
  const denyUrl = /^\/auth\/reissue-token$/;
  
  if(!denyUrl.test(config.url) && authStore.isLoggedIn) {
    const claims = jwtDecode(accessToken);
    const now = dayjs().unix();
    const expTime = dayjs.unix(claims.exp).add(-5, 'minute').unix();

    if(now >= expTime) {
      try {
        await authStore.reissue();
        accessToken = authStore.accessToken;
      } catch (error) {
        console.error(error?.response);
      }
    }
  }
  if(accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

export default myAxios;