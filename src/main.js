// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';
import VueGtag from 'vue-gtag';

import Helpers from '@/plugins/Helpers';
import ImpressoLayout from '@/plugins/Layout';
import TawkTo from '@/plugins/TawkTo';
import EventBus from '@/plugins/EventBus';
import MetaTags from '@/plugins/MetaTags';
import Navigation from '@/plugins/Navigation';

import * as services from '@/services';

import 'dripicons/webfont/webfont.css';
import 'impresso-theme/dist/css/bootpresso.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import App from './App';
import router from './router';
import store from './store';
import messages from './i18n/messages';
import dateTimeFormats from './i18n/dateTimeFormats';

Vue.use(BootstrapVue);
Vue.use(VueI18n);
// custom created plugins
Vue.use(Helpers);
Vue.use(EventBus);
Vue.use(ImpressoLayout);
Vue.use(MetaTags, { suffix: 'impresso' });
Vue.use(Navigation);
if (process.env.VUE_APP_TAWK_TO_SITE_ID) {
  Vue.use(TawkTo, { siteId: process.env.VUE_APP_TAWK_TO_SITE_ID });
}
if (process.env.VUE_APP_GA_TRACKING_ID) {
  Vue.use(VueGtag, {
    config: {
      id: process.env.VUE_APP_GA_TRACKING_ID,
    },
  }, router);
}
Vue.config.productionTip = process.env.NODE_ENV === 'production';
Vue.config.errorHandler = error => store.dispatch('DISPLAY_ERROR', {
  error,
  origin: 'Vue.config.errorHandler',
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason) {
    store.dispatch('DISPLAY_ERROR', {
      error: event.reason,
      origin: 'unhandledrejection',
    });
  }
});

// Create VueI18n instance with options
const i18n = new VueI18n({
  fallbackLocale: 'en',
  locale: store.state.settings.language_code,
  messages,
  dateTimeFormats,
  silentTranslationWarn: true, // setting this to `true` hides warn messages about translation keys.
});

const reducedTimeoutPromise = ({ ms = 500, service }) => new Promise((resolve, reject) => {
  let id = setTimeout(() => {
    clearTimeout(id);
    reject(`Timed out in ${ms} ms for service: ${service}`);
  }, ms);
});

/* eslint-disable no-new */
console.info('Checking authentication...');
Promise.race([
  services.app.reAuthenticate(),
  reducedTimeoutPromise({ service: 'app.reAuthenticate' }),
]).catch((err) => {
  if (err.code === 401) {
    console.info('Authentication failed:', err.message);
    if (store.state.user.userData) {
      console.info('Authentication failed ... but an user is present. Force logging out.');
      store.dispatch('user/LOGOUT');
      store.dispatch('DISPLAY_ERROR', {
        error: err,
        origin: 'services.app.reAuthenticate',
      });
    }
  } else {
    console.error(err);
  }
}).then(() => {
  console.info('Loading app & data version...');
  return Promise.race([
    reducedTimeoutPromise({ service: 'version' }),
    services.version.find().then((res) => ({
      version: res.version,
      dataVersion: res.solr.dataVersion,
      apiVersion: res.apiVersion,
      documentsDateSpan: res.documentsDateSpan,
      newspapers: res.newspapers,
      features: res.features
    }))
  ]).catch((err) => {
    console.error(err);
    return {
      version: 'n/a',
      dataVersion: 'n/a',
      documentsDateSpan: { firstDate: '1700-01-01', lastDate: new Date().toISOString() },
      apiVersion: {},
      newspapers: {}
    };
  });
}).then(({ version, dataVersion, documentsDateSpan, newspapers, apiVersion = {}, features = {} }) => {
  console.info(`Version services:${version}, data:${dataVersion}`);
  window.impressoVersion = version;
  window.impressoDataVersion = dataVersion;
  window.impressoApiVersion = apiVersion
  window.impressoDocumentsDateSpan = documentsDateSpan
  window.impressoNewspapers = newspapers
  window.impressoFeatures = features

  window.app = new Vue({
    el: '#app',
    i18n,
    router,
    store,
    template: '<App/>',
    components: {
      App,
    },
    render: h => h(App),
  });
});

console.info('Last notification date', store.state.settings.lastNotificationDate);
