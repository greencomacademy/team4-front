import axios from 'axios';

const api = axios.create({
  // 개발 중에는 Vite Proxy를 사용하므로 비워둔다.
  // 나중에 배포 주소가 생기면 .env의 값을 사용한다.
  baseURL: import.meta.env.VITE_API_BASE_URL || '',

  // Refresh Token을 쿠키로 주고받을 때 필요하다.
  withCredentials: true,

  // 서버가 10초 동안 응답하지 않으면 요청 실패 처리
  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// 모든 API 요청이 백엔드로 나가기 직전에 실행된다.
api.interceptors.request.use(
  (config) => {
    // 로그인할 때 저장한 Access Token을 꺼낸다.
    const accessToken = localStorage.getItem('accessToken');

    // 토큰이 있으면 Authorization 헤더에 자동으로 추가한다.
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

export default api;