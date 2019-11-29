import Vue from 'vue';
import SearchQuery from '@/models/SearchQuery';

const getQueryById = (state, id) => {
  if (state.searchQueries[id] === undefined) {
    Vue.set(state.searchQueries, id, new SearchQuery({
      filters: [{ type: 'hasTextContents' }],
    }));
  }
  return state.searchQueries[id];
};

export default {
  namespaced: true,
  state: {
    searchQueries: {},
  },
  getters: {
    getSearchQuery: state => id => getQueryById(state, id),
  },
  mutations: {
    ADD_FILTER(state, { filter, searchQueryId }) {
      getQueryById(state, searchQueryId).addFilter({ ...filter });
    },
    REMOVE_FILTER(state, { filter, searchQueryId }) {
      getQueryById(state, searchQueryId).removeFilter(filter);
    },
    RESET_FILTER(state, { type, searchQueryId }) {
      getQueryById(state, searchQueryId).resetFilter(type);
    },
    UPDATE_FILTER(state, { searchQueryId, filter, q, op, context, precision, distance }) {
      getQueryById(state, searchQueryId)
        .updateFilter({ filter, q, op, context, precision, distance });
    },
    UPDATE_FILTER_ITEM(state, { searchQueryId, filter, item, uid }) {
      getQueryById(state, searchQueryId)
        .updateFilterItem({ filter, item, uid });
    },
    UPDATE_QUERY_COMPONENTS(state, { searchQueryId, queryComponents }) {
      getQueryById(state, searchQueryId)
        .enrichFilters(queryComponents);
    },
    CLEAR(state) {
      state.searchQueries = {};
    },
    SET_SEARCH_QUERY_FILTERS(state, { searchQueryId, filters }) {
      getQueryById(state, searchQueryId).updateFilters(filters);
    },
  },
  actions: {
    ADD_FILTER({ commit }, message) {
      commit('ADD_FILTER', message);
    },
    REMOVE_FILTER({ commit }, message) {
      commit('REMOVE_FILTER', message);
    },
    UPDATE_FILTER({ commit }, message) {
      commit('UPDATE_FILTER', message);
    },
    UPDATE_FILTER_ITEM({ commit }, message) {
      commit('UPDATE_FILTER_ITEM', message);
    },
    UPDATE_QUERY_COMPONENTS({ commit }, { searchQueryId, queryComponents }) {
      commit('UPDATE_QUERY_COMPONENTS', { searchQueryId, queryComponents });
    },
    SET_SEARCH_QUERY_FILTERS({ commit }, { searchQueryId, filters }) {
      commit('SET_SEARCH_QUERY_FILTERS', { searchQueryId, filters });
    },
  },
};
