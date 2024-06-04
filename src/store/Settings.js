export default {
  namespaced: true,
  state: {
    language_code: 'en',
    termsAgreed: false,
    cookiesAccepted: false,
    lastNotificationDate: (new Date(0)).toISOString(),
    searchDisplayStyle: 'list'
  },
  getters: {
    lastNotificationDate(state) {
      return new Date(state.lastNotificationDate);
    },
  },
  mutations: {
    SET_LANGUAGE(state, payload) {
      state.language_code = payload.language_code;
    },
    SET_TERMS_AGREED(state, value) {
      state.termsAgreed = Boolean(value);
    },
    SET_COOKIES_ACCEPTED(state, value) {
      state.cookiesAccepted = Boolean(value);
    },
    SET_LAST_NOTIFICATION_DATE(state) {
      state.lastNotificationDate = (new Date()).toISOString();
    },
    UPDATE_SEARCH_DISPLAY_STYLE(state, displayStyle) {
      state.searchDisplayStyle = displayStyle;
    }
  },
  actions: {
    ACCEPT_TERMS_OF_USE({ commit }) {
      console.info('settings/ACCEPT_TERMS_OF_USE');
      commit('SET_TERMS_AGREED', true);
    },
    ACCEPT_COOKIES({ commit }) {
      commit('SET_COOKIES_ACCEPTED', true);
    },
    UPDATE_LAST_NOTIFICATION_DATE({ commit }) {
      console.info('@settings/UPDATE_LAST_NOTIFICATION_DATE');
      commit('SET_LAST_NOTIFICATION_DATE');
    },
  },
};
