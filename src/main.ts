import { createApp } from 'vue'
import { initSequence } from './init'
import VueObserveVisibility from 'vue3-observe-visibility'

import 'dripicons/webfont/webfont.css'
import './assets/legacy/bootstrap-impresso-theme.css'
import './assets/legacy/bootstrap-vue.css'

import App from '@/App.vue'
import router from '@/router'

import { useNotificationsStore } from './stores/notifications'
import { newI18n } from './plugins/i18n'
import pinia from './plugins/pinia'
import globalComponents from './plugins/globalComponents'

const app = createApp(App)

app.config.errorHandler = (error) => {
  const notificationsStore = useNotificationsStore()
  notificationsStore.displayError({
    error: error as any,
    origin: 'Vue.config.errorHandler'
  })
}

app.use(pinia)
app.use(router)
app.use(newI18n())
app.use(globalComponents)
app.use(VueObserveVisibility)

initSequence().then(() => app.mount('#app-container'))

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayError({
      error: event.reason,
      origin: 'unhandledrejection'
    })
  }
})
