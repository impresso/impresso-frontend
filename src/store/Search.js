const uuid = require('uuid');

function Search({
    query = '',
    displaySortBy = 'relevance',
    displaySortOrder = 'asc',
    displayStyle = 'list',
  } = {}) {
  this.query = query;
  this.uuid = uuid.v4();
  this.displaySortBy = displaySortBy;
  this.displaySortOrder = displaySortOrder;
  this.displayStyle = displayStyle;
}

export default {
  namespaced: true,
  state: {
    search: new Search(),
    searches: [],
  },
  getters: {
    getSearches(state) {
      return state.searches;
    },
    getSearchesReversed(state) {
      return state.searches.slice().reverse();
    },
  },
  mutations: {
    UPDATE_SEARCH_QUERY(state, payload) {
      state.search.query = payload.query;
    },
    UPDATE_SEARCH_DISPLAY_SORT(state, payload) {
      state.search.displaySortOrder = payload.displaySortOrder;
      state.search.displaySortBy = payload.displaySortBy;
    },
    UPDATE_SEARCH_DISPLAY_STYLE(state, payload) {
      state.search.displayStyle = payload.displayStyle;
    },
    STORE_SEARCH(state) {
      state.searches.push(state.search);
      state.search = new Search(state.search);
    },
    CLEAR_QUERY(state) {
      state.search.query = '';
    },
    LOAD_SEARCH(state, id) {
      if (state.searches.length) {
        // load last search
        let searchData = state.searches[state.searches.length - 1];

        // or if id is set then load search with specifici uuid
        if (id) {
          searchData = state.searches.find(search => search.uuid === id);
        }

        state.search = new Search(searchData);
      }
    },
  },
};
