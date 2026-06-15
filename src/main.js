import { createApp } from 'vue'
import './style.css';
import App from './App.vue'
import router from './router' // 1. router 폴더에서 라우터 설정을 불러옵니다.
<<<<<<< HEAD
import './assets/main.css'
import { createPinia } from 'pinia'

createApp(App)
.use(createPinia())
.use(router)
=======
import { createPinia } from 'pinia'

createApp(App)
  .use(router)
  .use(createPinia())
>>>>>>> cc26a8f (로그인 회원가입 화면)
  .mount('#app')