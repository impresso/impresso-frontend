import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from '../plugins/pinia'
import globalComponents from '../plugins/globalComponents'
import { newI18n } from '../plugins/i18n'

import '@/assets/legacy/bootstrap-impresso-theme.css'
import '@/assets/legacy/bootstrap-vue.css'
import '@/styles/style.css'
import { reducedTimeoutPromise } from '@/services/utils'
import { useNotificationsStore } from '@/stores/notifications'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(newI18n())
app.use(globalComponents)

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

document.addEventListener('DOMContentLoaded', async () => {
  console.debug('[main.ts] DOM fully loaded and parsed')
  try {
    await Promise.all([
      waitForConnectivity(),
      reducedTimeoutPromise({ ms: 1000, service: 'minimum delay', silent: true })
    ])
    console.debug('[main.ts] Connectivity established!')

    app.mount('#app-container')
    const loadingElement = document.getElementById('app-container-loading')
    if (loadingElement) {
      loadingElement.style.opacity = '0'
      setTimeout(() => {
        loadingElement.remove()
      }, 1000)
    }
  } catch (error) {
    console.error('[main.ts] Failed to establish connectivity.', error)
  }
})
