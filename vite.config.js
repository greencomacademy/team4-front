import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // '/auth'로 시작하는 요청은 아래 타겟으로 보냅니다.
      '/auth': {
        target: 'http://localhost:8080', // 실제 백엔드 주소
        changeOrigin: true,
      }
    }
  }
})