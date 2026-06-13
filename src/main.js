import { createApp } from 'vue'
<<<<<<< HEAD
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
=======
import { createPinia } from 'pinia';

import App from './App.vue'
import router from './router' // 1. router 폴더에서 라우터 설정을 불러옵니다.
import './style.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia);
app.use(router) // 2. 🚨 여기가 빠져서 난 에러입니다! 반드시 추가해야 합니다.
app.mount('#app')
>>>>>>> ce63d0a (260614 [dev] 메인피니아, 바이트컨피그, api 엑시오스설정)
