import * as services from '@/services';
import Article from '@/models/Article';
import Bucket from '@/models/Bucket';
import Topic from '@/models/Topic';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
import Newspaper from '@/models/Newspaper';
import Collection from '@/models/Collection';
import Facet from '@/models/Facet';
// import FilterFactory from '@/models/FilterFactory';
import router from '../router';

export default {
  namespaced: true,
  state: {
    search: new SearchQuery({
      filters: [{ type: 'hasTextContents' }],
    }),
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
    facetTypes: ['year', 'newspaper', 'language', 'topic', 'collection'], // this also sets the order of the filters
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
    UPDATE_SEARCH_QUERY_FILTERS(state, filters) {
      state.search.updateFilters(filters);
      console.log('commit->UPDATE_SEARCH_QUERY_FILTERS, after:', state.search.filters);
    },
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
      console.log('#->UPDATE_QUERY_COMPONENTS, queryComponents:', queryComponents);
      state.search.enrichFilters(queryComponents);
      state.queryComponents = queryComponents.map(d => new QueryComponent(d));
    },
    UPDATE_FILTER_FACET_YEAR_EXPANDED(state, expanded) {
      state.filterFacetYearExpanded = expanded;
    },
    ADD_FILTER(state, filter) {
      console.log('#->ADD_FILTER', filter);
      state.search.addFilter(filter);
    },
    REMOVE_FILTER(state, filter) {
      state.search.removeFilter(filter);
    },
    RESET_FILTER(state, type) {
      state.search.resetFilter(type);
    },
    UPDATE_FILTER(state, { filter, q, op, context }) {
      state.search.updateFilter({ filter, q, op, context });
    },
    UPDATE_FILTER_ITEM(state, { filter, item, uid }) {
      state.search.updateFilterItem({ filter, item, uid });
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
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS(context) {
      const query = {
        f: JSON.stringify(context.state.search.getFilters()),
        // facets: context.state.facetTypes,
        g: context.state.groupBy,
        p: context.state.paginationCurrentPage,
        // limit: context.state.paginationPerPage,
        o: context.state.orderBy,
      };
      console.log('@PUSH_SEARCH_PARAMS', query);
      router.push({ name: 'search', query });
    },
    PULL_SEARCH_PARAMS(context, query) {
      if (query.g && ['articles'].indexOf(query.g) !== -1) {
        context.commit('UPDATE_SEARCH_GROUP_BY', query.g);
      }
      if (query.o && ['-relevance', 'relevance', 'date', '-date'].indexOf(query.o) !== -1) {
        context.commit('UPDATE_SEARCH_ORDER_BY', query.o);
      }
      if (query.p && !isNaN(query.p)) {
        context.commit('UPDATE_PAGINATION_CURRENT_PAGE', parseInt(query.p, 10));
      }
      console.log('@PULL_SEARCH_PARAMS', query);

      // parse filters here.
      try {
        context.commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
      } catch (err) {
        console.log(err);
      }
      context.dispatch('SEARCH');
    },
    ADD_OR_REPLACE_FILTER(context, filter) {
      console.log('ADD_OR_REPLACE_FILTER', 'deprecated', filter);
      // const index = context.state.search.filters.findIndex(item => item.type === filter.type);
      // if (index > -1) {
      //   context.commit('UPDATE_FILTER', {
      //     index,
      //     filter,
      //   });
      // } else {
      //   context.commit('ADD_FILTER', filter);
      // }
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
    EXPORT_FROM_QUERY(context, payload) {
      // console.log(context, services.exporter.methods.create);
      return new Promise((resolve) => {
        services.exporter.create({
          description: payload.description,
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
          const query = {
            filters: context.getters.getSearch.getFilters(),
            facets: context.state.facetTypes,
            group_by: context.state.groupBy,
            page: context.state.paginationCurrentPage,
            limit: context.state.paginationPerPage,
            order_by: context.state.orderBy,
          };
          console.log('->action:SEARCH', query);
          services.search.find({
            query,
          }).then(
            (res) => {
              context.commit('CLEAR_FACETS');

              context.commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));

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
                  operators: ['OR', 'AND'],
                  buckets: res.info.facets.topic.buckets.map(bucket => ({
                    ...bucket,
                    item: new Topic({
                      ...bucket.item,
                      uid: bucket.val,
                    }),
                  })),
                });
                // enrich current fitler, if any, with one of the topics.
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

              // add collection facet/filter
              if (res.info.facets && res.info.facets.collection) {
                const facet = new Facet({
                  type: 'collection',
                  buckets: res.info.facets.collection.buckets.map(bucket => ({
                    ...bucket,
                    item: new Collection({
                      ...bucket.item,
                      uid: bucket.val,
                    }),
                  })),
                });

                context.commit('ADD_FACET', facet);
              }

              if (res.info.facets && res.info.facets.year) {
                const facet = new Facet({
                  type: 'year',
                  buckets: res.info.facets.year.buckets.map((bucket) => {
                    if (bucket instanceof Bucket) {
                      return bucket;
                    }

                    return new Bucket(bucket);
                  }).sort((a, b) => parseInt(a.val, 10) - parseInt(b.val, 10)),
                });
                context.commit('ADD_FACET', facet);
              }
              context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
                paginationTotalRows: res.total,
              });
              context.commit('UPDATE_QUERY_COMPONENTS', res.info.queryComponents);
              resolve(res);
            },
            (err) => {
              reject(err);
            },
          );
        },
      );

      return search;
    },
  },
};
