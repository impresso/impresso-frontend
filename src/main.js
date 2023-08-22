// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueI18n from 'vue-i18n'
import VueGtag from 'vue-gtag'

import Helpers from '@/plugins/Helpers'
import ImpressoLayout from '@/plugins/Layout'
import TawkTo from '@/plugins/TawkTo'
import EventBus from '@/plugins/EventBus'
import MetaTags from '@/plugins/MetaTags'
import Navigation from '@/plugins/Navigation'
import { createI18n, castToVueI18n } from 'vue-i18n-bridge'
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
Vue.use(VueI18n, { bridge: true })
// custom created plugins
Vue.use(Helpers)
Vue.use(EventBus)
Vue.use(ImpressoLayout)
Vue.use(MetaTags, { suffix: 'impresso' })
Vue.use(Navigation)
if (import.meta.env.VITE_TAWK_TO_SITE_ID) {
  Vue.use(TawkTo, { siteId: import.meta.env.VITE_TAWK_TO_SITE_ID })
}
if (import.meta.env.VITE_GA_TRACKING_ID) {
  Vue.use(
    VueGtag,
    {
      config: {
        id: import.meta.env.VITE_GA_TRACKING_ID,
      },
    },
    router,
  )
}
Vue.config.productionTip = import.meta.env.NODE_ENV === 'production'
Vue.config.errorHandler = (error) =>
  store.dispatch('DISPLAY_ERROR', {
    error,
    origin: 'Vue.config.errorHandler',
  })

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    store.dispatch('DISPLAY_ERROR', {
      error: event.reason,
      origin: 'unhandledrejection',
    })
  }
})

// Create VueI18n instance with options
const i18n = castToVueI18n(
  createI18n(
    {
      fallbackLocale: 'en',
      locale: store.state.settings.language_code,
      messages,
      dateTimeFormats,
      numberFormats,
      legacy: false,
      silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
    },
    VueI18n,
  ),
)

Vue.use(i18n)

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
  import.meta.env.VITE_GIT_TAG,
  '\n - branch:',
  import.meta.env.VITE_GIT_BRANCH,
  `\n - url: https://github.com/impresso/impresso-frontend/commit/${
    import.meta.env.VITE_GIT_REVISION
  }`,
  '\n - Adobe TYPEKIT_ID:',
  import.meta.env.VITE_TYPEKIT_ID,
  '\n - host:',
  import.meta.env.VITE_MIDDLELAYER_API,
)

console.info('STICAZZI')

Promise.race([
  services.app.reAuthenticate(),
  reducedTimeoutPromise({ service: 'app.reAuthenticate' }),
])
  .catch((err) => {
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
      services.version.find().then((res) => ({
        version: res.version,
        apiVersion: res.apiVersion,
        documentsDateSpan: res.documentsDateSpan,
        newspapers: res.newspapers,
        features: res.features,
      })),
    ]).catch((err) => {
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
        render: (h) =>
          h(App, {
            props: {
              startYear: window.impressoDocumentsYearSpan.firstYear,
              endYear: window.impressoDocumentsYearSpan.lastYear,
            },
          }),
      })
    },
  )
