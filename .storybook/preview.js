import Vue from 'vue';
import VueI18n from 'vue-i18n';
import { Plugin as Fragment } from 'vue-fragment'

Vue.use(VueI18n);
Vue.use(Fragment)

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

