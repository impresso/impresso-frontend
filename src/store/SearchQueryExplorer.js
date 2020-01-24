import Article from '@/models/Article';
import SearchQuery from '@/models/SearchQuery';
import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    results: [],
    isActive: false,
    isLoading: false,
    searchQueryHash: '',
    pagination: {
      perPage: 1,
      currentPage: 1,
      totalRows: -1,
    },
  },
  mutations: {
    SET_IS_LOADING(state, value) {
      state.isLoading = value;
    },
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
    GET_CONTEXT_SEARCH_RESULT({ state, commit, dispatch }, { filters, page }) {
      const hash = SearchQuery.serialize({ filters }, 'protobuf');
      // if (state.searchQueryHash === hash && page === state.pagination.currentPage) {
      //   console.info('GET_CONTEXT_SEARCH_RESULT: SearchQuery already loaded. Skipping.', hash);
      // } else {
      commit('SET_IS_LOADING', true);
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
        console.info('SearchQueryExplorer/GET_CONTEXT_SEARCH_RESULT', res);
        dispatch('search/UPDATE_QUERY_COMPONENTS', res.info.queryComponents, { root: true });
        commit('SET_RESULTS', res.data.map(result => new Article(result)));
      }).finally(() => {
        commit('SET_IS_LOADING', false);
      });
      // }
    },
  },
};
