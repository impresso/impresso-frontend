const EXPLORER_STATUS_ON = 'on';
const EXPLORER_STATUS_OFF = 'off';

export default {
  namespaced: true,
  state: {
    q: '',
    status: EXPLORER_STATUS_OFF,
    type: 'person',
    mode: 'search', // 'search' or 'facets'
    filters: [], // current filters, used in facet mode
    temporaryFilter: null,
    searchQueryId: '',
  },
  getters: {
    getTemporaryFilter: state => (searchQueryId) => {
      if (state.searchQueryId === searchQueryId) {
        return state.temporaryFilter;
      }
      return null;
    },
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
    SET_FILTERS(state, filters) {
      console.info('MUTATION store.explorer/SET_FILTERS', filters);
      state.filters = filters;
    },
    SET_TEMPORARY_FILTER(state, filter) {
      console.info('MUTATION store.explorer/SET_TEMPORARY_FILTER', filter);
      state.temporaryFilter = filter;
    },
    SET_SEARCH_QUERY_ID(state, searchQueryId) {
      console.info('MUTATION store.explorer/SET_SEARCH_QUERY_ID', searchQueryId);
      state.searchQueryId = searchQueryId;
    },
  },
  actions: {
    ADD_FILTER({ commit, state }, filter) {
      commit('SET_TEMPORARY_FILTER', filter);
    },
    SET_SEARCH_QUERY_ID({ commit }, searchQueryId) {
      commit('SET_SEARCH_QUERY_ID', searchQueryId);
    },
    SHOW({ commit }, { type, q, mode, filters }) {
      console.info('store.explorer/SHOW type:', type, '- q:', q, '- mode:', mode, '- filters:', filters);
      if (q) {
        commit('SET_Q', q);
      }
      if (type) {
        commit('SET_TYPE', type);
      }
      if (mode) {
        commit('SET_MODE', mode);
      }
      if (filters) {
        commit('SET_FILTERS', filters);
      }
      // reset temporary filter
      commit('SET_TEMPORARY_FILTER', null);
      // always commit as last
      commit('SET_STATUS', EXPLORER_STATUS_ON);
    },
    HIDE({ commit }) {
      commit('SET_STATUS', EXPLORER_STATUS_OFF);
    },
  },
};
