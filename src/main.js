// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueI18n from 'vue-i18n'
import VueGtag from 'vue-gtag'

import Helpers from '@/plugins/Helpers'
import ImpressoLayout from '@/plugins/Layout'
import EventBus from '@/plugins/EventBus'
import MetaTags from '@/plugins/MetaTags'
import Navigation from '@/plugins/Navigation'

import * as services from '@/services'

import 'dripicons/webfont/webfont.css'
import 'impresso-theme/dist/css/bootpresso.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App'
import router from './router'
import store from './store'
import messages from './i18n/messages'
import dateTimeFormats from './i18n/dateTimeFormats'
import numberFormats from '@/i18n/numberFormats'

Vue.use(BootstrapVue)
Vue.use(VueI18n)
// custom created plugins
Vue.use(Helpers)
Vue.use(EventBus)
Vue.use(ImpressoLayout)
Vue.use(MetaTags, { suffix: 'impresso' })
Vue.use(Navigation)

if (process.env.VUE_APP_GA_TRACKING_ID) {
  Vue.use(
    VueGtag,
    {
      config: {
        id: process.env.VUE_APP_GA_TRACKING_ID,
      },
    },
    router,
  )
}
Vue.config.productionTip = process.env.NODE_ENV === 'production'
Vue.config.errorHandler = error =>
  store.dispatch('DISPLAY_ERROR', {
    error,
    origin: 'Vue.config.errorHandler',
  })

window.addEventListener('unhandledrejection', event => {
  if (event.reason) {
    store.dispatch('DISPLAY_ERROR', {
      error: event.reason,
      origin: 'unhandledrejection',
    })
  }
})

// Create VueI18n instance with options
const i18n = new VueI18n({
  fallbackLocale: 'en',
  locale: store.state.settings.language_code,
  messages,
  dateTimeFormats,
  numberFormats,
  silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
})

const reducedTimeoutPromise = ({ ms = 500, service }) =>
  new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id)
      reject(`Timed out in ${ms} ms for service: ${service}`)
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
  process.env.VUE_APP_GIT_TAG,
  '\n - branch:',
  process.env.VUE_APP_GIT_BRANCH,
  `\n - url: https://github.com/impresso/impresso-frontend/commit/${process.env.VUE_APP_GIT_REVISION}`,
  '\n - Adobe TYPEKIT_ID:',
  process.env.VUE_APP_TYPEKIT_ID,
  '\n - host:',
  process.env.VUE_APP_MIDDLELAYER_API,
)

Promise.race([
  services.app.reAuthenticate(),
  reducedTimeoutPromise({ service: 'app.reAuthenticate' }),
])
  .catch(err => {
    if (err.code === 401) {
      // eslint-disable-next-line
      console.debug('[main] Not authenticated (status 401):', err.message)
      if (store.state.user.userData) {
        // eslint-disable-next-line
        console.debug(
          '[main] Authentication failed ... but an user is present in logalStorage. Force logging out.',
        )
        store.dispatch('user/LOGOUT')
        store.dispatch('DISPLAY_ERROR', {
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
      // eslint-disable-next-line
      console.debug(
        '[main] App latest notification date:',
        store.state.settings.lastNotificationDate,
      )
      window.impressoFrontendVersion = process.env.VUE_APP_GIT_TAG
      window.impressoFrontendRevision = process.env.VUE_APP_GIT_REVISION
      window.impressoFrontendBranch = process.env.VUE_APP_GIT_BRANCH
      window.impressoVersion = version
      window.impressoApiVersion = apiVersion
      window.impressoDocumentsDateSpan = documentsDateSpan
      window.impressoNewspapers = newspapers
      window.impressoFeatures = features
      window.impressoDocumentsYearSpan = {
        firstYear: new Date(documentsDateSpan.firstDate).getFullYear(),
        lastYear: new Date(documentsDateSpan.lastDate).getFullYear(),
      }

      window.app = new Vue({
        el: '#app',
        i18n,
        router,
        store,
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
