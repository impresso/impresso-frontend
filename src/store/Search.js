// TODO: make action to load search results form the server
// this should set this.results and this.paginationTotalRows

const uuid = require('uuid');

function Search({
    query = '',
    displaySortBy = 'relevance',
    displaySortOrder = 'asc',
    displayStyle = 'list',
    paginationPerPage = 10,
    filterDateRangeStart = 0,
    filterDateRangeEnd = (new Date()).getFullYear(),
    filterBoundingBox = [],
  } = {}) {
  this.query = query;
  this.uuid = uuid.v4();
  this.displaySortBy = displaySortBy;
  this.displaySortOrder = displaySortOrder;
  this.displayStyle = displayStyle;
  this.paginationPerPage = paginationPerPage;
  this.paginationCurrentPage = 1;
  this.paginationTotalRows = 2;
  this.filterDateRangeStart = filterDateRangeStart;
  this.filterDateRangeEnd = filterDateRangeEnd;
  this.filterBoundingBox = filterBoundingBox;
}

function SearchResult({
  title = 'test title',
  image = 'test image',
  extract = 'test extract',
  details = [],
} = {}) {
  this.title = title;
  this.image = image;
  this.extract = extract;
  this.details = details;
}

export default {
  namespaced: true,
  state: {
    search: new Search(),
    searches: [],
    results: [],
    is_searching: false,
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
    UPDATE_PAGINATION_CURRENT_PAGE(state, payload) {
      state.search.paginationCurrentPage = payload.paginationCurrentPage;
    },
    UPDATE_FILTER_DATE_RANGE(state, payload) {
      state.search.filterDateRangeStart = parseInt(payload.filterDateRangeStart, 10);
      state.search.filterDateRangeEnd = parseInt(payload.filterDateRangeEnd, 10);
    },
    UPDATE_FILTER_BOUNDING_BOX(state, payload) {
      state.search.filterBoundingBox = payload;
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
    CLEAR_RESULTS(state) {
      state.results = [];
    },
    UPDATE_RESULTS(state, results) {
      state.results = results;
    },
    UPDATE_SEARCH_STATUS(state, status) {
      if (status) {
        state.is_searching = true;
      } else {
        state.is_searching = false;
      }
    },
  },
  actions: {
    SEARCH(context) {
      context.commit('CLEAR_RESULTS');
      context.commit('UPDATE_SEARCH_STATUS', true);

      const results = [];

      return new Promise(
        (resolve) => {
          setTimeout(() => {
            for (let i = 0; i < 10; i += 1) {
              results.push(new SearchResult({
                title: `Article Title number ${i}`,
                image: 'http://placehold.it/300x300',
                extract: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                details: [{
                  col_a: i,
                  col_b: 'abc',
                }, {
                  col_a: i * 10,
                  col_b: 'def',
                }],
              }));
            }

            context.commit('UPDATE_RESULTS', results);
            context.commit('UPDATE_SEARCH_STATUS', false);

            resolve(results);
          }, Math.floor(Math.random() * 4000) + 500);
        },
      );
    },
  },
};
