import Article from '@/models/Article';
import SearchQuery from '@/models/SearchQuery';
import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    results: [],
    isActive: false,
    searchQueryHash: '',
    pagination: {
      perPage: 3,
      currentPage: 1,
      totalRows: -1,
    },
  },
  mutations: {
    SET_IS_ACTIVE(state, isActive) {
      state.isActive = Boolean(isActive);
    },
    SET_PAGINATION(state, { page, limit, total }) {
      if (typeof limit !== 'undefined') {
        state.pagination.perPage = limit;
      }
      if (typeof page !== 'undefined') {
        state.pagination.currentPage = page;
      }
      if (typeof total !== 'undefined') {
        state.pagination.totalRows = total;
      }
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
    GET_CONTEXT_SEARCH_RESULT({ state, commit }, { filters, page }) {
      const hash = SearchQuery.serialize({ filters }, 'protobuf');
      if (state.searchQueryHash === hash && page === state.pagination.currentPage) {
        console.info('GET_CONTEXT_SEARCH_RESULT: SearchQuery already loaded. Skipping.', hash);
      } else {
        commit('SET_PAGINATION', {
          page,
        });
        commit('SET_SEARCH_QUERY_HASH', hash);
        services.search.find({
          lock: false,
          query: {
            filters,
            group_by: 'articles',
            page: state.pagination.currentPage,
            limit: state.pagination.perPage,
          },
        }).then((res) => {
          commit('SET_PAGINATION', {
            page,
            total: res.total,
          });
          commit('SET_RESULTS', res.data.map(result => new Article(result)));
        });
      }
    },
  },
};
