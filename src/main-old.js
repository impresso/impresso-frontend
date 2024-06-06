// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { createPinia, PiniaVuePlugin } from 'pinia'
import { createPersistedState } from 'pinia-plugin-persistedstate'


import Helpers from '@/plugins/Helpers'
import ImpressoLayout from '@/plugins/Layout'
import EventBus from '@/plugins/EventBus'
import MetaTags from '@/plugins/MetaTags'
import Navigation from '@/plugins/Navigation'
import BootstrapVueLegacyComponents from '@/plugins/BootstrapVueLegacy.ts'

import * as services from '@/services'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import './assets/legacy/bootstrap-vue.css'

import App from './App'
import router from './router'
import messages from './i18n/messages'
import dateTimeFormats from './i18n/dateTimeFormats'
import numberFormats from '@/i18n/numberFormats'
import { useSettingsStore } from './stores/settings'
import { useUserStore } from './stores/user'
import { useNotificationsStore } from './stores/notifications'

Vue.use(PiniaVuePlugin)
Vue.use(BootstrapVueLegacyComponents)
Vue.use(VueI18n)
// custom created plugins
Vue.use(Helpers)
Vue.use(EventBus)
Vue.use(ImpressoLayout)
Vue.use(MetaTags, { suffix: 'impresso' })
Vue.use(Navigation)

const pinia = createPinia()
pinia.use(createPersistedState({
  key: id => `__impresso__${id}`,
}))

Vue.config.productionTip = import.meta.env.NODE_ENV === 'production'
Vue.config.errorHandler = error => {
  const notificationsStore = useNotificationsStore()
  notificationsStore.displayError({
    error,
    origin: 'Vue.config.errorHandler',
  })
}


window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    const notificationsStore = useNotificationsStore()
    notificationsStore.displayError({
      error: event.reason,
      origin: 'unhandledrejection',
    })
  }
})

// pinia cannot be used without a Vue instance
// creating an instance here that won't be used
// anywhere later
const _throwawayApp = new Vue({ pinia })
const settingsStore = useSettingsStore()

// Create VueI18n instance with options
const i18n = new VueI18n({
  fallbackLocale: 'en',
  locale: settingsStore.language_code,
  messages,
  dateTimeFormats,
  numberFormats,
  silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
})

const reducedTimeoutPromise = ({ ms = 500, service }) =>
  new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id)
      reject(new Error(`Timed out in ${ms} ms for service: ${service}`))
    }, ms)
  })

const DefaultImpressoFeatures = {
  textReuse: { enabled: true },
}

// eslint-disable-next-line
console.info(
  '%cimpresso-frontend version',
  'font-weight: bold',
  '\n - tag:',
  import.meta.env.VITE_GIT_TAG,
  '\n - branch:',
  import.meta.env.VITE_GIT_BRANCH,
  `\n - url: https://github.com/impresso/impresso-frontend/commit/${import.meta.env.VITE_GIT_REVISION}`,
  '\n - Adobe TYPEKIT_ID:',
  import.meta.env.VITE_TYPEKIT_ID,
  '\n - host:',
  import.meta.env.VITE_MIDDLELAYER_API,
)

Promise.race([
  services.app.reAuthenticate(),
  reducedTimeoutPromise({ ms: 2000, service: 'app.reAuthenticate' }),
])
  .catch(err => {
    if (err.code === 401) {
      // eslint-disable-next-line
      console.debug('[main] Not authenticated (status 401):', err.message)
      const userStore = useUserStore()

      if (userStore.user) {
        // eslint-disable-next-line
        console.debug(
          '[main] Authentication failed ... but an user is present in logalStorage. Force logging out.',
        )
        userStore.logout()

        const notificationsStore = useNotificationsStore()
        notificationsStore.displayError({
          error: err,
          origin: 'services.app.reAuthenticate',
        })
      }
    } else {
      console.error(err)
    }
  })
  .then(() => {
    // eslint-disable-next-line
    console.debug('[main] Loading app & data version...')
    return Promise.race([
      reducedTimeoutPromise({ service: 'version' }),
      services.version.find().then(res => ({
        version: res.version,
        apiVersion: res.apiVersion,
        documentsDateSpan: res.documentsDateSpan,
        newspapers: res.newspapers,
        features: res.features,
      })),
    ]).catch(err => {
      console.warn(err)
      return {
        version: 'n/a',
        documentsDateSpan: { firstDate: '1700-01-01', lastDate: new Date().toISOString() },
        apiVersion: {},
        newspapers: {},
      }
    })
  })
  .then(
    ({
      version,
      documentsDateSpan,
      newspapers,
      apiVersion = {},
      features = DefaultImpressoFeatures,
    }) => {
      console.info(
        '%cimpresso-middle-layer version',
        'font-weight: bold',
        '\n - tag:',
        apiVersion.version,
        '\n - branch:',
        apiVersion.branch,
        `\n - url: https://github.com/impresso/impresso-middle-layer/commit/${apiVersion.revision}`,
        '\n - name:',
        version,
        '\n - date range: ',
        documentsDateSpan,
        '\n - features:',
        features,
      )
      window.impressoFrontendVersion = import.meta.env.VITE_GIT_TAG
      window.impressoFrontendRevision = import.meta.env.VITE_GIT_REVISION
      window.impressoFrontendBranch = import.meta.env.VITE_GIT_BRANCH
      window.impressoVersion = version
      window.impressoApiVersion = apiVersion
      window.impressoDocumentsDateSpan = documentsDateSpan
      window.impressoNewspapers = newspapers
      window.impressoFeatures = features
      window.impressoDocumentsYearSpan = {
        firstYear: new Date(documentsDateSpan.firstDate).getFullYear(),
        lastYear: new Date(documentsDateSpan.lastDate).getFullYear(),
      }
      window.impressoInfo = {
        frontend: {
          version: window.impressoFrontendVersion,
          revision: window.impressoFrontendRevision,
          branch: window.impressoFrontendBranch,
          gitRepoUrl: import.meta.env.VITE_GIT_REPO,
          gitCommitUrl: `${import.meta.env.VITE_GIT_REPO}/commit/${window.impressoFrontendRevision}`,
          gitCommitUrlLabel: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
        middleLayer: {
          version: 'v' + window.impressoApiVersion.version,
          revision: window.impressoApiVersion.revision,
          branch: window.impressoApiVersion.branch,
          gitRepoUrl: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO,
          gitCommitUrl: `${import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO}/commit/${window.impressoApiVersion.revision}`,
          gitCommitUrlLabel: import.meta.env.VITE_MIDDLE_LAYER_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
        project: {
          repoUrl: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(0, 4)
            .join('/'),
          repoUrlLabel: import.meta.env.VITE_GIT_REPO.split('/')
            .slice(3, 5)
            .join('/'),
        },
      }

      window.app = new Vue({
        el: '#app',
        i18n,
        router,
        pinia,
        template: '<App/>',
        components: {
          App,
        },
        render: h =>
          h(App, {
            props: {
              startYear: window.impressoDocumentsYearSpan.firstYear,
              endYear: window.impressoDocumentsYearSpan.lastYear,
            },
          }),
      })
    },
  )
