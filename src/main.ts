import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'
import { initSequence } from './init'
import BootstrapVueLegacy from '@/plugins/BootstrapVueLegacy'
import ImpressoLayout from '@/plugins/Layout'

import App from '@/App.vue'
import router from '@/router'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import './assets/legacy/bootstrap-vue.css'
import { useNotificationsStore } from './stores/notifications'
import { useSettingsStore } from './stores/settings'
import datetimeFormats from '@/i18n/dateTimeFormats'
import numberFormats from '@/i18n/numberFormats'
import messages from '@/i18n/messages'


const app = createApp(App)

app.config.errorHandler = (error) => {
  const notificationsStore = useNotificationsStore()
  notificationsStore.displayError({
    error: error as any,
    origin: 'Vue.config.errorHandler',
  })
}

BootstrapVueLegacy.install(app)
ImpressoLayout.install(app)

const pinia = createPinia()
pinia.use(createPersistedState({
  key: id => `__impresso__${id}`,
}))

app.use(pinia)
app.use(router)

const settingsStore = useSettingsStore()
app.use(createI18n({
  legacy: true,
  fallbackLocale: 'en',
  locale: settingsStore.language_code,
  messages,
  datetimeFormats,
  numberFormats,
  silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
}))

initSequence().then(() => app.mount('#app'))
// app.mount('#app')

window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayError({
      error: event.reason,
      origin: 'unhandledrejection',
    })
  }
})
