// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

    server: {
    proxy: {
      // '/auth' 대신 '/api'로 변경합니다.
      '/api': {
        target: 'http://localhost:8080', 
        changeOrigin: true,
      }
    }
    }
})

