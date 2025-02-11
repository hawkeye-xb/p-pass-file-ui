import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import { i18n } from './i18n'
import { themeService } from '@/services/theme'

themeService.init();

const app = createApp(App)
app.use(i18n)
app.use(createPinia())
app.use(router)
app.use(ArcoVue)

app.mount('#app')
