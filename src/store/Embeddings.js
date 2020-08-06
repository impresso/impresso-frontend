export default {
  namespaced: true,
  state: {
    language: 'fr',
    limit: 25,
  },
  mutations: {
    UPDATE_LANGUAGE(state, language) {
      state.language = language;
    },
    UPDATE_LIMIT(state, limit) {
      state.limit = limit;
    },
  }
}
