import * as services from '@/services';
import Article from '@/models/Article';
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
    searchImages: new SearchQuery(),
    imageSearches: [],
    results: [],
    facets: [],
    orderBy: '-relevance', // relevance, -relevance, date, -date
    groupBy: 'articles', // issues, pages, articles, sentences
    displayStyle: 'tiles',
    paginationPerPage: 12,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    queryComponents: [],
    facetTypes: ['year', 'newspaper', 'language'], // this also sets the order of the filters
    filterFacetYearExpanded: false,
  },
  getters: {
    getSearches(state) {
      return state.imageSearches;
    },
    getSearchesReversed(state) {
      return state.imageSearches.slice().reverse();
    },
    getSearch(state) {
      return state.searchImages instanceof SearchQuery ?
        state.searchImages : new SearchQuery(state.searchImages);
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
      state.searchImages.updateFilters(filters);
      console.log('commit->UPDATE_SEARCH_QUERY_FILTERS, after:', state.searchImages.filters);
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
      state.searchImages.enrichFilters(queryComponents);
      state.queryComponents = queryComponents.map(d => new QueryComponent(d));
    },
    UPDATE_FILTER_FACET_YEAR_EXPANDED(state, expanded) {
      state.filterFacetYearExpanded = expanded;
    },
    ADD_FILTER(state, filter) {
      console.log('#->ADD_FILTER', filter);
      state.searchImages.addFilter(filter);
    },
    REMOVE_FILTER(state, filter) {
      state.searchImages.removeFilter(filter);
    },
    RESET_FILTER(state, type) {
      state.searchImages.resetFilter(type);
    },
    UPDATE_FILTER(state, { filter, q, op, context }) {
      state.searchImages.updateFilter({ filter, q, op, context });
    },
    UPDATE_FILTER_ITEM(state, { filter, item }) {
      state.searchImages.updateFilterItem({ filter, item });
    },
    STORE_SEARCH(state) {
      state.imageSearches.push(state.searchImages);
      state.searchImages = new SearchQuery(state.searchImages);
    },
    CLEAR(state) {
      state.searchImages = new SearchQuery();
      state.results = [];
      state.facets = [];
      state.paginationCurrentPage = 1;
      state.paginationTotalRows = 0;
    },
    LOAD_SEARCH(state, id) {
      if (state.imageSearches.length) {
        // load last search
        let searchData = state.imageSearches[state.imageSearches.length - 1];

        // or if id is set then load search with specifici uuid
        if (id) {
          searchData = state.imageSearches.find(search => search.uuid === id);
        }

        state.searchImages = new SearchQuery(searchData);
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
    // UPDATE_FILTER_IS_FRONT(state, value) {
    //   state.searchImages.isFront = value;
    // },
    // UPDATE_FILTER_HAS_TEXT_CONTENTS(state, value) {
    //   state.searchImages.hasTextContents = value;
    // },
  },
  actions: {
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS(context) {
      const query = {
        f: JSON.stringify(context.state.searchImages.getFilters()),
        facets: context.state.facetTypes,
        // g: context.state.groupBy,
        p: context.state.paginationCurrentPage,
        limit: context.state.paginationPerPage,
        o: context.state.orderBy,
      };
      router.push({ name: 'searchImages', query });
    },
    PULL_SEARCH_PARAMS(context, query) {
      if (query.o && ['-relevance', 'relevance', 'date', '-date'].indexOf(query.o) !== -1) {
        context.commit('UPDATE_SEARCH_ORDER_BY', query.o);
      }
      if (query.p && !isNaN(query.p)) {
        context.commit('UPDATE_PAGINATION_CURRENT_PAGE', parseInt(query.p, 10));
      }

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
          services.images.find({
            query,
          }).then(
            (res) => {
              // console.log('SEARCH res:', res);
              context.commit('CLEAR_FACETS');

              context.commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));


              // add article facet/filter
              // if (res.info.facets && res.info.facets.article) {
              //   const facet = new Facet({
              //     type: 'article',
              //     buckets: res.info.facets.article.buckets.map(bucket => ({
              //       ...bucket,
              //       item: {
              //         ...bucket.item,
              //         uid: bucket.val,
              //       },
              //     })),
              //   });
              //
              //   context.commit('ADD_FACET', facet);
              // }


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
