import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

    server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Request 대상 서버 도메인
        changeOrigin: true, // Request Header Host 필드 값을 대상 서버 호스트로 변경
        secure: false, // SSL 인증서 검증 무시 
      }
    }
    }
})

