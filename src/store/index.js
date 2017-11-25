import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import settings from './Settings';
import search from './Search';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    settings,
    search,
  },
  plugins: [createPersistedState()],
});
