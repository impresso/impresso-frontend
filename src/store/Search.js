import * as services from '@/services';
import Article from '@/models/Article';
import Collection from '@/models/Collection';
import QueryComponent from '@/models/QueryComponent';
import Match from '@/models/Match';
import SearchQuery from '@/models/SearchQuery';
import Newspaper from '@/models/Newspaper';
import Facet from '@/models/Facet';

export default {
  namespaced: true,
  state: {
    search: new SearchQuery(),
    searches: [],
    results: [],
    facets: [],
    orderBy: 'relevance', // relevance, -relevance, date, -date
    groupBy: 'articles', // issues, pages, articles, sentences
    displayStyle: 'list',
    paginationPerPage: 12, // TODO: make getter/setter and UI
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    queryComponents: [],
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
    facets(state) {
      return state.facets;
    },
  },
  mutations: {
    UPDATE_SEARCH_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_SEARCH_GROUP_BY(state, groupBy) {
      state.groupBy = groupBy;
    },
    UPDATE_SEARCH_DISPLAY_STYLE(state, displayStyle) {
      state.displayStyle = displayStyle;
    },
    UPDATE_PAGINATION_PER_PAGE(state, paginationPerPage) {
      state.paginationPerPage = parseInt(paginationPerPage, 10);
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
    UPDATE_QUERY_COMPONENTS(state, queryComponents) {
      state.queryComponents = queryComponents;
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
      state.facets = [];
      state.paginationCurrentPage = 1;
      state.paginationTotalRows = 0;
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
    ADD_FACET(state, facet) {
      state.facets.push(facet);
    },
  },
  actions: {
    SEARCH(context) {
      return new Promise(
        (resolve, reject) => {
          services.search.find({
            query: {
              filters: context.getters.getSearch.filters.map(filter => ({
                context: filter.context,
                type: filter.type,
                q: filter.query,
                uid: filter.getUid(),
              })),
              facets: ['newspaper', 'year', 'language'],
              group_by: context.state.groupBy,
              page: context.state.paginationCurrentPage,
              limit: context.state.paginationPerPage,
              order_by: context.state.orderBy,
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
                collections: result.buckets.map(bucket => new Collection({
                  ...bucket,
                  countArticles: bucket.count_articles,
                  countEntities: bucket.count_entities,
                  countIssues: bucket.count_issues,
                  countItems: bucket.count_items,
                  countPages: bucket.count_pages,
                  creationDate: bucket.creation_date,
                  creationTime: bucket.creation_time,
                  lastModifiedDate: bucket.last_modified_date,
                  lastModifiedTime: bucket.last_modified_time,
                })),
                matches: result.matches.map(match => new Match(match)),
                newspaper: new Newspaper({
                  ...result.newspaper,
                  countArticles: result.newspaper.count_articles,
                  countIssues: result.newspaper.count_issues,
                  countPages: result.newspaper.count_pages,
                  deltaYear: result.newspaper.delta_year,
                  endYear: result.newspaper.end_year,
                  startYear: result.newspaper.start_year,
                }),
              })));

              if (res.info.facets && res.info.facets.newspaper) {
                context.commit('ADD_FACET', new Facet({
                  type: 'newspaper',
                  buckets: res.info.facets.newspaper.buckets,
                }));
              }

              if (res.info.facets && res.info.facets.year) {
                context.commit('ADD_FACET', new Facet({
                  type: 'year',
                  buckets: res.info.facets.year.buckets,
                }));
              }

              if (res.info.facets && res.info.facets.language) {
                context.commit('ADD_FACET', new Facet({
                  type: 'language',
                  buckets: res.info.facets.language.buckets,
                }));
              }

              context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
                paginationTotalRows: res.total,
              });

              context.commit('UPDATE_QUERY_COMPONENTS', res.info.queryComponents.map(d => new QueryComponent(d)));

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
