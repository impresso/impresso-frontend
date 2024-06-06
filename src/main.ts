import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'
import { createI18n } from 'vue-i18n'
import { initSequence } from './init'
import BootstrapVueLegacy from '@/plugins/BootstrapVueLegacy'

import App from '@/App.vue'
import router from '@/router'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import './assets/legacy/bootstrap-vue.css'


const app = createApp(App)

BootstrapVueLegacy.install(app)

const pinia = createPinia()
pinia.use(createPersistedState({
  key: id => `__impresso__${id}`,
}))

app.use(pinia)
app.use(router)
app.use(createI18n({
  legacy: true,
}))

initSequence().then(() => app.mount('#app'))
// app.mount('#app')
