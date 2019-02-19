// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';

import ImpressoLayout from '@/plugins/Layout';

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
Vue.use(ImpressoLayout);

Vue.config.productionTip = process.env.NODE_ENV === 'production';

// Create VueI18n instance with options
const i18n = new VueI18n({
  fallbackLocale: 'en',
  locale: store.state.settings.language_code,
  messages,
  dateTimeFormats,
});

/* eslint-disable no-new */
services.app.authenticate().finally(() => {
  window.app = new Vue({
    el: '#app',
    i18n,
    router,
    store,
    template: '<App/>',
    components: {
      App,
    },
  });
});
