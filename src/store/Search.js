import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

const uuid = require('uuid');

const url = `${process.env.MIDDLELAYER_API}/articles`;

function Search({
    filters = [],
  } = {}) {
  this.filters = filters;
  this.uuid = uuid.v4();
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
    displaySortBy: 'relevance',
    displaySortOrder: 'asc',
    displayStyle: 'list',
    paginationPerPage: 10,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
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
    UPDATE_SEARCH_DISPLAY_SORT(state, payload) {
      state.displaySortOrder = payload.displaySortOrder;
      state.displaySortBy = payload.displaySortBy;
    },
    UPDATE_SEARCH_DISPLAY_STYLE(state, payload) {
      state.displayStyle = payload.displayStyle;
    },
    UPDATE_PAGINATION_CURRENT_PAGE(state, payload) {
      state.paginationCurrentPage = payload.paginationCurrentPage;
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.paginationTotalRows = payload.paginationTotalRows;
    },
    ADD_FILTER(state, payload) {
      // here we clone the payload/object using util.extend
      state.search.filters.push(Vue.util.extend({}, payload));
    },
    REMOVE_FILTER(state, payload) {
      state.search.filters.splice(payload.index, 1);
    },
    UPDATE_FILTER(state, payload) {
      state.search.filters[payload.key] = payload.filter;
    },
    STORE_SEARCH(state) {
      state.searches.push(state.search);
      state.search = new Search(state.search);
    },
    CLEAR(state) {
      state.search = new Search();
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

          if (context.state.displaySortOrder === 'desc') {
            sortOrder += '-';
          }

          sortOrder += context.state.displaySortBy;

          Vue.http.get(url,
            {
              params: {
                filters: context.state.search.filters,
                page: context.state.paginationCurrentPage,
                limit: context.state.paginationPerPage,
                order_by: sortOrder,
              },
            },
          ).then(
           (res) => {
             this.commit('SET_PROCESSING', false);

             if (res.body.records !== undefined) {
               for (let i = 0; i < res.body.records.length; i += 1) {
                 results.push(new SearchResult({
                   title: res.body.records[i].title,
                   dl: res.body.records[i].dl,
                   uid: res.body.records[i].uid,
                   image: 'http://placehold.it/300x300',
                   extract: 'Lorem ipsum.',
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
