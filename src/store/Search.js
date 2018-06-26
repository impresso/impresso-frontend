import * as services from '@/services';
import Article from '@/models/Article';
import SearchQuery from '@/models/SearchQuery';

export default {
  namespaced: true,
  state: {
    search: new SearchQuery(),
    searches: [],
    results: [],
    displaySortBy: 'relevance',
    displaySortOrder: 'asc',
    displayStyle: 'list',
    paginationPerPage: 12,
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
    getSearch(state) {
      return state.search instanceof SearchQuery ? state.search : new SearchQuery(state.search);
    },
    results(state) {
      return state.results.map((result) => {
        if (result instanceof Article) {
          return result;
        }

        return new Article(result);
      });
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
      if (typeof payload.paginationCurrentPage === 'undefined') {
        state.paginationCurrentPage = 1;
      } else {
        state.paginationCurrentPage = payload.paginationCurrentPage;
      }
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.paginationTotalRows = payload.paginationTotalRows;
    },
    ADD_FILTER(state, payload) {
      state.search.filters.push({
        ...payload,
      });
    },
    REMOVE_FILTER(state, payload) {
      state.search.filters.splice(payload.index, 1);
    },
    UPDATE_FILTER(state, payload) {
      state.search.filters[payload.key] = payload.filter;
    },
    STORE_SEARCH(state) {
      state.searches.push(state.search);
      state.search = new SearchQuery(state.search);
    },
    CLEAR(state) {
      state.search = new SearchQuery();
      state.results = [];
      state.paginationCurrentPage = 1;
    },
    LOAD_SEARCH(state, id) {
      if (state.searches.length) {
        // load last search
        let searchData = state.searches[state.searches.length - 1];

        // or if id is set then load search with specifici uuid
        if (id) {
          searchData = state.searches.find(search => search.uuid === id);
        }

        state.search = new SearchQuery(searchData);
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
      return new Promise(
        (resolve, reject) => {
          let sortOrder = '';

          if (context.state.displaySortOrder === 'desc') {
            sortOrder += '-';
          }

          sortOrder += context.state.displaySortBy;

          services.search.find({
            query: {
              filters: context.getters.getSearch.filters.map(filter => ({
                context: filter.context,
                type: filter.type,
                q: filter.query,
                uid: filter.getUid(),
              })),
              facets: ['newspaper', 'year', 'language'],
              group_by: 'articles', // TODO: this can be pages at a later stage
              page: context.state.paginationCurrentPage,
              limit: context.state.paginationPerPage,
              order_by: sortOrder,
              // TODO: group_by: 'article|issue|page';
            },
          }).then(
            (res) => {
              context.commit('UPDATE_RESULTS', res.data.map(result => new Article({
                ...result,
                issue: {
                  ...result.issue,
                  countArticles: result.issue.count_articles,
                  countPages: result.issue.count_pages,
                },
                tags: result.tags.map((tag) => {
                  tag.appliesTo = tag.applies_to;
                  return tag;
                }),
                newspaperUid: result.newspaper_uid,
              })));

              context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
                paginationTotalRows: res.total,
              });

              resolve(res);
            },
            (err) => {
              reject(err);
            },
          );
        },
      );
    },
  },
};
