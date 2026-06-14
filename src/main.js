import { createApp } from 'vue'
import { createPinia } from 'pinia';

import App from './App.vue'
import router from './router' // 1. router 폴더에서 라우터 설정을 불러옵니다.
import './style.css';

const app = createApp(App)
const pinia = createPinia()

app.use(pinia);
app.use(router) // 2. 🚨 여기가 빠져서 난 에러입니다! 반드시 추가해야 합니다.
app.mount('#app')