export default {
  namespaced: true,
  state: {
    language_code: 'en',
    termsAgreed: false,
  },
  getters: {
  },
  mutations: {
    SET_LANGUAGE(state, payload) {
      state.language_code = payload.language_code;
    },
    SET_TERMS_AGREED(state, value) {
      state.termsAgreed = Boolean(value);
    },
  },
  actions: {
    ACCEPT_TERMS_OF_USE({ commit }) {
      console.info('settings/ACCEPT_TERMS_OF_USE');
      commit('SET_TERMS_AGREED', true);
    },
  },
};
