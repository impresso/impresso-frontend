export default {
  namespaced: true,
  state: {
    language_code: 'en',
  },
  getters: {
  },
  mutations: {
    SET_LANGUAGE(state, payload) {
      state.language_code = payload.language_code;
    },
  },
  actions: {
  },
};
