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
    SET_TERMS_AGREED(state) {
      state.termsAgreed = true;
    },
  },
  actions: {
  },
};
