import * as services from '@/services';
import Article from '@/models/Article';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
import Newspaper from '@/models/Newspaper';
import Bucket from '@/models/Bucket';
// import Collection from '@/models/Collection';
import Facet from '@/models/Facet';
// import FilterFactory from '@/models/FilterFactory';
import router from '../router';

export default {
  namespaced: true,
  state: {
    search: new SearchQuery(),
    imageSearches: [],
    results: [],
    facets: [],
    orderBy: '-date', // relevance, -relevance, date, -date
    groupBy: 'images', // issues, pages, articles, sentences
    displayStyle: 'images',
    paginationPerPage: 12,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    queryComponents: [],
    facetTypes: ['year', 'newspaper'], // this also sets the order of the filters
    filterFacetYearExpanded: false,
    similarTo: false,
    similarToUploaded: false,
  },
  getters: {
    getSearches(state) {
      return state.imageSearches;
    },
    getSearchesReversed(state) {
      return state.imageSearches.slice().reverse();
    },
    getSearch(state) {
      return state.search instanceof SearchQuery ?
        state.search : new SearchQuery(state.search);
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
    UPDATE_SIMILAR_TO(state, imageUid) {
      state.similarTo = imageUid;
    },
    UPDATE_SIMILAR_TO_UPLOADED(state, similarToUploaded) {
      state.similarToUploaded = similarToUploaded;
    },
    // pagination
    UPDATE_PAGINATION_CURRENT_PAGE(state, page) {
      state.paginationCurrentPage = parseInt(page, 10);
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.paginationTotalRows = payload.paginationTotalRows;
    },
    UPDATE_QUERY_COMPONENTS(state, queryComponents) {
      state.search.enrichFilters(queryComponents);
      state.queryComponents = queryComponents.map(d => new QueryComponent(d));
    },
    UPDATE_FILTER_FACET_YEAR_EXPANDED(state, expanded) {
      state.filterFacetYearExpanded = expanded;
    },
    ADD_FILTER(state, filter) {
      state.search.addFilter(filter);
    },
    REMOVE_FILTER(state, filter) {
      state.search.removeFilter(filter);
    },
    RESET_FILTER(state, type) {
      state.search.resetFilter(type);
    },
    UPDATE_FILTER(state, { filter, q, op, context, precision, distance }) {
      state.search.updateFilter({ filter, q, op, context, precision, distance });
    },
    UPDATE_FILTER_ITEM(state, { filter, item, uid }) {
      state.search.updateFilterItem({ filter, item, uid });
    },
    STORE_SEARCH(state) {
      state.imageSearches.push(state.search);
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
      if (state.imageSearches.length) {
        // load last search
        let searchData = state.imageSearches[state.imageSearches.length - 1];

        // or if id is set then load search with specific uuid
        if (id) {
          searchData = state.imageSearches.find(search => search.uuid === id);
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
    // UPDATE_FILTER_HAS_TEXT_CONTENTS(state, value) {
    //   state.search.hasTextContents = value;
    // },
  },
  actions: {
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS(context) {
      const query = {
        f: JSON.stringify(context.state.search.getFilters()),
        p: context.state.paginationCurrentPage,
        o: context.state.orderBy,
      };

      if (context.state.similarToUploaded) {
        query.u = context.state.similarToUploaded;
      } else if (context.state.similarTo) {
        query.i = context.state.similarTo;
      }

      router.push({ name: 'searchImages', query });
    },
    PULL_SEARCH_PARAMS(context, query) {
      if (query.o && ['date', '-date'].indexOf(query.o) !== -1) {
        context.commit('UPDATE_SEARCH_ORDER_BY', query.o);
      }
      if (query.p && !isNaN(query.p)) {
        context.commit('UPDATE_PAGINATION_CURRENT_PAGE', parseInt(query.p, 10));
      }
      if (query.u) {
        context.commit('UPDATE_SIMILAR_TO_UPLOADED', query.u);
      } else if (query.i) {
        context.commit('UPDATE_SIMILAR_TO', query.i);
      }
      // parse filters here.
      try {
        context.commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
      } catch (err) {
        console.info(err);
      }
      context.dispatch('SEARCH');
    },
    ADD_OR_REPLACE_FILTER(context, filter) {
      console.error('ADD_OR_REPLACE_FILTER', 'deprecated', filter);
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
            similarTo: context.state.similarTo,
            similarToUploaded: context.state.similarToUploaded,
          };

          services.images.find({
            query,
          }).then(
            (res) => {
              context.commit('CLEAR_FACETS');

              context.commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));

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
              // if (res.info.facets && res.info.facets.collection) {
              //   const facet = new Facet({
              //     type: 'collection',
              //     buckets: res.info.facets.collection.buckets.map(bucket => ({
              //       ...bucket,
              //       item: new Collection({
              //         ...bucket.item,
              //         uid: bucket.val,
              //       }),
              //     })),
              //   });
              //
              //   context.commit('ADD_FACET', facet);
              // }


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
