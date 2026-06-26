import { createApp } from 'vue'

import './main.css';
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'



/*
 * number input 보정
 * - 브라우저 기본 스피너는 main.css에서 제거
 * - e, +, - 입력을 막고 숫자/소수점만 남긴다.
 * - 수수료율처럼 소수점이 필요한 필드가 있어서 '.'은 1개까지 허용한다.
 */
document.addEventListener('keydown', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.type !== 'number') {
    return;
  }

  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  if (target.type !== 'number') {
    return;
  }

  const originalValue = target.value;
  const sanitizedValue = originalValue
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');

  if (originalValue !== sanitizedValue) {
    target.value = sanitizedValue;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }
});

const app = createApp(App)
const pinia = createPinia()

app.use(pinia);
app.use(router)
app.mount('#app')
