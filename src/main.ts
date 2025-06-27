import { createApp } from 'vue'
import { initSequence, initUserTermsOfUse, initUserPlan, initSequenceDone } from './init'

import 'dripicons/webfont/webfont.css'
import './assets/legacy/bootstrap-impresso-theme.css'
import './assets/legacy/bootstrap-vue.css'

import App from '@/App.vue'
import router from '@/router'

import { useNotificationsStore } from './stores/notifications'
import { newI18n } from './plugins/i18n'
import pinia from './plugins/pinia'
import globalComponents from './plugins/globalComponents'
import { reducedTimeoutPromise } from './services/utils'

const app = createApp(App)

// app.config.errorHandler = error => {
//   const notificationsStore = useNotificationsStore()
//   notificationsStore.displayError({
//     error: error as any,
//     origin: 'Vue.config.errorHandler'
//   })
// }

app.use(pinia)
app.use(router)
app.use(newI18n())
app.use(globalComponents)

// Create a function to wait for connectivity
async function waitForConnectivity() {
  const notificationStore = useNotificationsStore()
  console.debug('[main.ts] waitForConnectivity() called.')
  return new Promise<boolean>(resolve => {
    console.debug('[main.ts] notificationStore.$subscribe')
    const unsubscribe = notificationStore.$subscribe((mutation, state) => {
      if (state.connectivityStatus) {
        console.debug('[main.ts] notificationStore connectivityStatus active')
        unsubscribe() // Stop listening after reaching the desired state
        resolve(true)
      }
    })

    // Optionally handle the initial state
    if (notificationStore.connectivityStatus) {
      console.debug('[main.ts] already connected :)')
      unsubscribe()
      resolve(true)
    }
  })
}

// window
document.addEventListener('DOMContentLoaded', async () => {
  console.debug('[main.ts] DOM fully loaded and parsed')
  const loadingElement = document.getElementById('app-container-loading')
  console.debug('[main.ts] Check DOM loading elements...', loadingElement)

  try {
    await Promise.all([
      waitForConnectivity,
      reducedTimeoutPromise({ ms: 500, service: 'minimum delay', silent: true })
    ])
    console.debug('[main.ts] Connectivity established!')
    await initSequence()
    app.mount('#app-container')
    loadingElement.classList.add('dismissed')
    // Proceed with actions that require network connectivity
    await initUserTermsOfUse()
    //
    await initUserPlan()

    initSequenceDone()
  } catch (error) {
    console.error('[main.ts] Failed to establish connectivity.', error)
  }
})

window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayError({
      error: event.reason,
      origin: 'unhandledrejection'
    })
  }
})
