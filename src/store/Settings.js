export default {
  namespaced: true,
  state: {
    language_code: 'en',
    sidebar_userdata_expanded: false, // the userdata sidebar on issue page
  },
  getters: {
  },
  mutations: {
    SET_LANGUAGE(state, payload) {
      state.language_code = payload.language_code;
    },
    TOGGLE_USERDATA_EXPANDED(state) {
      state.sidebar_userdata_expanded = !state.sidebar_userdata_expanded;
    },
  },
  actions: {
  },
};
