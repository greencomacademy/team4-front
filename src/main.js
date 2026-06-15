import { createApp } from 'vue'
import './style.css';
import App from './App.vue'
import router from './router' // 1. router 폴더에서 라우터 설정을 불러옵니다.
import { createPinia } from 'pinia'

createApp(App)
  .use(router)
  .use(createPinia())
  .mount('#app')