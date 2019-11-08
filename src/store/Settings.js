export default {
  namespaced: true,
  state: {
    language_code: 'en',
    termsAgreed: false,
    lastNotificationDate: (new Date(0)).toISOString(),
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
    SET_LAST_NOTIFICATION_DATE(state) {
      state.lastNotificationDate = (new Date()).toISOString();
    },
  },
  actions: {
    ACCEPT_TERMS_OF_USE({ commit }) {
      console.info('settings/ACCEPT_TERMS_OF_USE');
      commit('SET_TERMS_AGREED', true);
    },
    HIDE_JOBS_NOTIFICATION({ commit }) {
      console.info('settings/HIDE_JOBS_NOTIFICATION');
      commit('SET_LAST_NOTIFICATION_DATE');
    },
  },
};
