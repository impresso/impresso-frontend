import Article from '@/models/Article';
import SearchQuery from '@/models/SearchQuery';
import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    offset: -1,
    totalRows: -1,
    results: [],
    isActive: false,
    searchQueryHash: '',
  },
  mutations: {
    SET_IS_ACTIVE(state, isActive) {
      state.isActive = Boolean(isActive);
    },
    SET_OFFSET(state, offset) {
      state.offset = Math.max(offset - 1, 0);
    },
    SET_TOTAL(state, totalRows) {
      state.totalRows = totalRows;
    },
    SET_RESULTS(state, results) {
      state.results = results;
    },
    SET_SEARCH_QUERY_HASH(state, hash) {
      state.searchQueryHash = hash;
    },
  },
  actions: {
    TOGGLE({ state, commit }) {
      commit('SET_IS_ACTIVE', !state.isActive);
    },
    GET_CONTEXT_SEARCH_RESULT({ state, commit }, { filters, offset }) {
      const hash = SearchQuery.serialize({ filters }, 'protobuf');
      if (state.searchQueryHash === hash && offset === state.offset) {
        console.info('GET_CONTEXT_SEARCH_RESULT: SearchQuery already loaded. Skipping.', hash);
      } else {
        commit('SET_TOTAL', -1);
        commit('SET_SEARCH_QUERY_HASH', hash);
        commit('SET_OFFSET', offset);
        services.search.find({
          query: {
            filters,
            group_by: 'articles',
            offset: state.offset,
            limit: 3,
          },
        }).then((res) => {
          commit('SET_TOTAL', res.total);
          commit('SET_RESULTS', res.data.map(result => new Article(result)));
        });
      }
    },
  },
};
