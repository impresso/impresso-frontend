import { createApp } from 'vue'
import { initSequence } from './init'

import App from '@/App.vue'
import router from '@/router'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import './assets/legacy/bootstrap-vue.css'
import { useNotificationsStore } from './stores/notifications'
import { newI18n } from './plugins/i18n'
import pinia from './plugins/pinia'
import globalComponents from './plugins/globalComponents'


const app = createApp(App)

app.config.errorHandler = (error) => {
  const notificationsStore = useNotificationsStore()
  notificationsStore.displayError({
    error: error as any,
    origin: 'Vue.config.errorHandler',
  })
}



app.use(pinia)
app.use(router)
app.use(newI18n())
app.use(globalComponents)

initSequence().then(() => app.mount('#app'))

window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayError({
      error: event.reason,
      origin: 'unhandledrejection',
    })
  }
})