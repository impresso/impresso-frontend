import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

const uuid = require('uuid');

const url = `${process.env.MIDDLELAYER_API}/articles`;

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
  this.paginationTotalRows = 0;
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
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.search.paginationTotalRows = payload.paginationTotalRows;
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
  },
  actions: {
    SEARCH(context) {
      context.commit('CLEAR_RESULTS');
      this.commit('SET_PROCESSING', true);

      const results = [];

      return new Promise(
        (resolve, reject) => {
          let sortOrder = '';

          if (context.state.search.displaySortOrder === 'desc') {
            sortOrder += '-';
          }

          sortOrder += context.state.search.displaySortBy;

          Vue.http.get(url,
            {
              params: {
                query: context.state.search.query,
                page: context.state.search.paginationCurrentPage,
                limit: context.state.search.paginationPerPage,
                sort_order: sortOrder,
              },
            },
          ).then(
           (res) => {
             this.commit('SET_PROCESSING', false);

             if (res.body.records !== undefined) {
               for (let i = 0; i < res.body.records.length; i += 1) {
                 results.push(new SearchResult({
                   title: `${res.body.records[i].name}`,
                   image: 'http://placehold.it/300x300',
                   extract: `${res.body.records[i].name} Lorem ipsum.`,
                   details: [{
                     col_a: i,
                     col_b: 'abc',
                   }, {
                     col_a: i * 10,
                     col_b: 'def',
                   }],
                 }));
               }

               context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
                 paginationTotalRows: res.body.count,
               });
               context.commit('UPDATE_RESULTS', results);
             }

             resolve(res);
           },
           (err) => {
             this.commit('SET_PROCESSING', false);
             reject(err);
           },
         );
        },
      );
    },
  },
};
