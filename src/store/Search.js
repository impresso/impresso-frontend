import * as services from '@/services';
import Article from '@/models/Article';
import Bucket from '@/models/Bucket';
import Topic from '@/models/Topic';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
import Newspaper from '@/models/Newspaper';
import Facet from '@/models/Facet';
import FilterFactory from '@/models/FilterFactory';

export default {
  namespaced: true,
  state: {
    search: new SearchQuery(),
    searches: [],
    results: [],
    facets: [],
    orderBy: '-relevance', // relevance, -relevance, date, -date
    groupBy: 'articles', // issues, pages, articles, sentences
    displayStyle: 'list',
    paginationPerPage: 12,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    queryComponents: [],
    facetTypes: ['newspaper', 'language', 'topic'], // this also sets the order of the filters
    filterFacetYearExpanded: false,
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
    // general settings
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
    // pagination
    UPDATE_PAGINATION_CURRENT_PAGE(state, page) {
      state.paginationCurrentPage = parseInt(page, 10);
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.paginationTotalRows = payload.paginationTotalRows;
    },
    UPDATE_QUERY_COMPONENTS(state, queryComponents) {
      state.queryComponents = queryComponents;
    },
    UPDATE_FILTER_FACET_YEAR_EXPANDED(state, expanded) {
      state.filterFacetYearExpanded = expanded;
    },
    ADD_FILTER(state, filter) {
      state.search.filters.push(filter);
    },
    REMOVE_FILTER(state, index) {
      if (index > -1) {
        state.search.filters.splice(index, 1);
      }
    },
    UPDATE_FILTER(state, payload) {
      state.search.filters.splice(payload.index, 1, payload.filter);
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
    CLEAR_FACETS(state) {
      state.facets = [];
    },
    ADD_FACET(state, facet) {
      state.facets.push(facet);
    },
    UPDATE_FILTER_IS_FRONT(state, value) {
      state.search.isFront = value;
    },
    UPDATE_FILTER_HAS_TEXT_CONTENTS(state, value) {
      state.search.hasTextContents = value;
    },
  },
  actions: {
    ADD_OR_REPLACE_FILTER(context, filter) {
      const index = context.state.search.filters.findIndex(item => item.type === filter.type);
      if (index > -1) {
        context.commit('UPDATE_FILTER', {
          index,
          filter,
        });
      } else {
        context.commit('ADD_FILTER', filter);
      }
    },
    CREATE_COLLECTION_FROM_QUERY(context, collectionUid) {
      return new Promise((resolve) => {
        services.search.create({}, {
          query: {
            collection_uid: collectionUid,
            group_by: 'articles',
            filters: context.getters.getSearch.getFilters(),
          },
        }).then(res => resolve(res));
      });
    },
    EXPORT_FROM_QUERY(context, {
      description,
    }) {
      // console.log(context, services.exporter.methods.create);
      return new Promise((resolve) => {
        services.exporter.create({
          description,
        }, {
          query: {
            group_by: 'articles',
            filters: context.getters.getSearch.getFilters(),
            format: 'csv',
          },
        }).then(res => resolve(res));
      });
    },
    SEARCH(context) {
      const search = new Promise(
        (resolve, reject) => {
          services.search.find({
            query: {
              filters: context.getters.getSearch.getFilters(),
              facets: context.state.facetTypes,
              group_by: context.state.groupBy,
              page: context.state.paginationCurrentPage,
              limit: context.state.paginationPerPage,
              order_by: context.state.orderBy,
            },
          }).then(
            (res) => {
              context.commit('CLEAR_FACETS');

              context.commit('UPDATE_RESULTS', res.data.map(result => new Article({
                ...result,
                issue: {
                  ...result.issue,
                  countArticles: result.issue.count_articles,
                  countPages: result.issue.count_pages,
                },
                tags: result.tags ? result.tags.map((tag) => {
                  tag.appliesTo = tag.applies_to;
                  return tag;
                }) : [],
                collections: result.collections,
                matches: result.matches || [],
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

              // add language facet/filter
              if (res.info.facets && res.info.facets.language) {
                const facet = new Facet({
                  type: 'language',
                  buckets: res.info.facets.language.buckets.map(bucket => ({
                    ...bucket,
                    item: {
                      ...bucket.item,
                      uid: bucket.val,
                    },
                  })),
                });

                context.commit('ADD_FACET', facet);
              }

              // add topic facet/filter
              if (res.info.facets && res.info.facets.topic) {
                const facet = new Facet({
                  type: 'topic',
                  buckets: res.info.facets.topic.buckets.map(bucket => ({
                    ...bucket,
                    item: new Topic({
                      ...bucket.item,
                      uid: bucket.val,
                    }),
                  })),
                });

                context.commit('ADD_FACET', facet);
              }

              // add newspaper facet/filter
              if (res.info.facets && res.info.facets.newspaper) {
                const facet = new Facet({
                  type: 'newspaper',
                  buckets: res.info.facets.newspaper.buckets.map(bucket => ({
                    ...bucket,
                    item: new Newspaper(bucket.item),
                  })),
                });

                context.commit('ADD_FACET', facet);
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

      const timeline = new Promise(
        (resolve, reject) => {
          services.search.find({
            query: {
              filters: context.getters.getSearch.getFilters(['daterange']),
              facets: ['year'],
              group_by: context.state.groupBy,
              page: context.state.paginationCurrentPage,
              limit: context.state.paginationPerPage,
              order_by: context.state.orderBy,
            },
          }).then(
            (res) => {
              // add year facet/filter
              if (res.info.facets && res.info.facets.year) {
                const facet = new Facet({
                  type: 'year',
                  buckets: res.info.facets.year.buckets.map((bucket) => {
                    if (bucket instanceof Bucket) {
                      return bucket;
                    }

                    return new Bucket(bucket);
                  }).sort((a, b) => {
                    // order from first year to last year (1798 - 1997)
                    const yearA = parseInt(a.val, 10);
                    const yearB = parseInt(b.val, 10);

                    if (yearA < yearB) {
                      return -1;
                    }

                    if (yearA > yearB) {
                      return 1;
                    }

                    return 0;
                  }),
                });

                const FilterFacetYear = FilterFactory.create({
                  ...context.getters.getSearch.filters.find(filter => filter.type === 'year'),
                  ...facet,
                });

                context.dispatch('ADD_OR_REPLACE_FILTER', FilterFacetYear);
              }
              resolve(res);
            },
            (err) => {
              reject(err);
            },
          );
        },
      );

      return Promise.all([search, timeline]);
    },
  },
};
