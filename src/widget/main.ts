import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from '../plugins/pinia'
import { newI18n } from '../plugins/i18n'

const app = createApp(App)
app.use(pinia)
app.use(router)

app.use(newI18n())
app.mount('#app-container')
