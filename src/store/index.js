import Vue from 'vue';
import Vuex from 'vuex';
import settings from './Settings';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    settings,
  },
  plugins: [],
});
