import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);


export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

