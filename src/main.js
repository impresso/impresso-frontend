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
if (process.env.VUE_APP_TAWK_TO_SITE_ID) {
  Vue.use(TawkTo, { siteId: process.env.VUE_APP_TAWK_TO_SITE_ID });
}
Vue.use(VueGtag, {
  config: {
    id: process.env.VUE_APP_GA_TRACKING_ID,
  },
}, router);
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

/* eslint-disable no-new */
console.info('Checking authentication...');
services.app.reAuthenticate().catch((err) => {
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
}).finally(() => {
  services.version.find().then((res) => {
    console.info(`Version services:${res.version}, data:${res.solr.dataVersion}`);
    window.impressoVersion = res.version;
    window.impressoDataVersion = res.solr.dataVersion;
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
});

console.info('Last notification date', store.state.settings.lastNotificationDate);
