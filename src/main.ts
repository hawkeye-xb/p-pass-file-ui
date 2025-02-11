import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';

import { i18n } from './i18n'

// Windows 环境下调整 neutral 颜色
if (navigator.userAgent.toLowerCase().includes('windows')) {
  // 调整 neutral-3 到 neutral-9 的颜色值
  for (let i = 3; i <= 9; i++) {
    document.documentElement.style.setProperty(
      `--color-neutral-${i}`,
      `rgb(var(--gray-${i + 1}))`
    );
  }
}

const app = createApp(App)
app.use(i18n)
app.use(createPinia())
app.use(router)
app.use(ArcoVue)

app.mount('#app')
