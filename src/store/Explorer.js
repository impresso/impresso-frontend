const EXPLORER_STATUS_ON = 'on';
const EXPLORER_STATUS_OFF = 'off';

export default {
  namespaced: true,
  state: {
    q: '',
    status: EXPLORER_STATUS_OFF,
    type: 'person',
    mode: 'search', // 'search' or 'facets'
  },
  mutations: {
    SET_MODE(state, mode) {
      state.mode = mode;
    },
    SET_STATUS(state, status) {
      console.info('MUTATION store.explorer/SET_STATUS', status);
      state.status = status;
    },
    SET_Q(state, q) {
      state.q = String(q || '');
    },
    SET_TYPE(state, type) {
      state.type = type;
    },
  },
  actions: {
    SHOW({ commit }, { type, q, mode }) {
      console.info('store.explorer/SHOW', typeof type, typeof q, typeof mode);
      if (q) {
        commit('SET_Q', q);
      }
      if (type) {
        commit('SET_TYPE', type);
      }
      if (mode) {
        commit('SET_MODE', mode);
      }
      // always commit as last
      commit('SET_STATUS', EXPLORER_STATUS_ON);
    },
    HIDE({ commit }) {
      commit('SET_STATUS', EXPLORER_STATUS_OFF);
    },
  },
};
