import { protobuf } from 'impresso-jscommons';
import * as services from '@/services';
import Article from '@/models/Article';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
import Facet from '@/models/Facet';
import Helpers from '@/plugins/Helpers';
import router from '../router';

/**
 * NOTE: Most of this store is not used and will be downsized/removed soon.
 */

export default {
  namespaced: true,
  state: {
    search: new SearchQuery({
      filters: [{ type: 'hasTextContents' }],
    }),
    currentSearchHash: '',
    currentSearchIsPristine: true,
    searches: [],
    results: [],
    facets: [
      new Facet({
        type: 'year',
      }),
      new Facet({
        type: 'type',
      }),
      new Facet({
        type: 'collection',
      }),
      new Facet({
        type: 'country',
      }),
      new Facet({
        type: 'person',
        operators: ['OR', 'AND'],
      }),
      new Facet({
        type: 'location',
        operators: ['OR', 'AND'],
      }),
      new Facet({
        type: 'language',
      }),
      new Facet({
        type: 'newspaper',
      }),
      new Facet({
        type: 'topic',
        operators: ['OR', 'AND'],
      }),
      new Facet({
        type: 'accessRight',
      }),
      new Facet({
        type: 'partner',
      }),
    ],
    facetTypes: ['person', 'location', 'year', 'newspaper', 'language', 'topic', 'collection', 'accessRight', 'partner'], // this also sets the order of the filters
    orderBy: '-relevance', // -relevance, date, -date
    orderByOptions: ['-relevance', 'date', '-date'],
    groupBy: 'articles', // issues, pages, articles, sentences
    displayStyle: 'list',
    paginationPerPage: 12,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    queryComponents: [],
    filterFacetYearExpanded: false,
    isLoadingResults: false,
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
    getCurrentSearch(state) {
      return state.search;
    },
    getCurrentSearchHash(state) {
      return state.search.getSerialized({ serializer: 'protobuf' });
    },
    countActiveFilters(state) {
      return state.search.countActiveFilters();
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
      state.search.addFilter({ ...filter });
      state.currentSearchHash = state.search.getSerialized({ serializer: 'protobuf' });
    },
    INITIALIZE_FILTERS(state, filters) {
      filters.forEach(d => state.search.addFilter(d));
      state.currentSearchHash = state.search.getSerialized({ serializer: 'protobuf' });
    },
    REMOVE_FILTER(state, filter) {
      state.search.removeFilter(filter);
      state.currentSearchHash = state.search.getSerialized({ serializer: 'protobuf' });
    },
    RESET_FILTER(state, type) {
      state.search.resetFilter(type);
      state.currentSearchHash = state.search.getSerialized({ serializer: 'protobuf' });
    },
    UPDATE_FILTER(state, { filter, q, op, context, precision, distance }) {
      state.search.updateFilter({ filter, q, op, context, precision, distance });
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
    UPDATE_IS_LOADING(state, isLoadingResults) {
      state.isLoadingResults = Boolean(isLoadingResults);
    },
    UPDATE_FACET(state, { type, numBuckets, buckets }) {
      const facet = state.facets.find(d => d.type === type);
      if (facet) {
        facet.numBuckets = numBuckets;
        if (type === 'year') {
          // sort bucket differently
          const sortedBuckets = buckets.sort((a, b) => parseInt(a.val, 10) - parseInt(b.val, 10));
          facet.setBuckets(sortedBuckets);
        } else {
          facet.setBuckets(buckets);
        }
      } else {
        console.error('Could not find any `facet` having type:', type);
      }
    },
    UPDATE_FACET_BUCKETS(state, { type, buckets }) {
      const facet = state.facets.find(d => d.type === type);
      if (facet) {
        facet.buckets = buckets;
      } else {
        console.error('Could not find any `facet` having type:', type);
      }
    },
    UPDATE_FILTER_IS_FRONT(state, value) {
      state.search.isFront = value;
    },
    UPDATE_FILTER_HAS_TEXT_CONTENTS(state, value) {
      state.search.hasTextContents = value;
    },
    UPDATE_SEARCH_IS_PRISTINE(state, value) {
      state.currentSearchIsPristine = Boolean(value);
    },
    MERGE_FILTER_AT_INDEX(state, { index, filter }) {
      state.search.mergeFilterAtIndex(filter, index)
    }
  },
  actions: {
    UPDATE_SEARCH_QUERY_FILTERS({ commit }, filters) {
      commit('UPDATE_SEARCH_QUERY_FILTERS', filters)
    },
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS({ state, commit }, { routeName = 'search', page = 0 } = {}) {
      if (page > 0) {
        commit('UPDATE_PAGINATION_CURRENT_PAGE', page);
      }
      const query = {
        sq: state.search.getSerialized({
          serializer: 'protobuf',
        }),
        f: JSON.stringify(state.search.getFilters()),
        // facets: state.facetTypes,
        g: state.groupBy,
        p: state.paginationCurrentPage,
        // limit: state.paginationPerPage,
        o: state.orderBy,
      };
      console.info('@PUSH_SEARCH_PARAMS', query);
      router.push({ name: routeName, query });
    },
    PULL_SEARCH_PARAMS({ commit, dispatch }, query) {
      if (query.g && ['articles'].indexOf(query.g) !== -1) {
        commit('UPDATE_SEARCH_GROUP_BY', query.g);
      }
      if (query.o && ['-relevance', 'date', '-date'].indexOf(query.o) !== -1) {
        commit('UPDATE_SEARCH_ORDER_BY', query.o);
      }
      if (query.p && !isNaN(query.p)) {
        commit('UPDATE_PAGINATION_CURRENT_PAGE', parseInt(query.p, 10));
      }
      console.info('@PULL_SEARCH_PARAMS', query);
      if (query.f) {
        try {
          // try to PARSE json filters
          commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
        } catch (err) {
          if (err.name === 'SyntaxError') {
            console.warn('SyntaxError. Cannot parse query filters:', query.f);
          } else {
            console.error(err);
          }
        }
      }
      // do search!
      dispatch('SEARCH');
    },
    ADD_FILTER_TO_CURRENT_SEARCH({ state, commit, dispatch }, filter) {
      if (!state.search.filtersIndex[filter.type]) {
        commit('ADD_FILTER', filter);
      } else {
        console.warn('still TODO behaviour of ADD_FILTER_TO_CURRENT_SEARCH', filter);
        commit('ADD_FILTER', filter);
      }
      dispatch('PUSH_SEARCH_PARAMS');
    },
    ADD_OR_REPLACE_FILTER(context, filter) {
      console.warn('ADD_OR_REPLACE_FILTER', 'deprecated', filter);
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
    CREATE_COLLECTION_FROM_QUERY(context, { filters, collectionUid }) {
      return new Promise((resolve) => {
        services.search.create({
          group_by: 'articles',
          filters: filters,
          collection_uid: collectionUid,
        }).then(res => resolve(res));
      });
    },
    EXPORT_FROM_QUERY(context, payload) {
      // console.info(context, services.exporter.methods.create);
      const filters = payload.filters || context.getters.getSearch.getFilters();
      return new Promise((resolve) => {
        services.exporter.create({
          description: payload.description,
        }, {
          query: {
            group_by: 'articles',
            filters,
            format: 'csv',
          },
        }).then(res => resolve(res));
      });
    },
    EXPORT_FROM_UIDS(context, { filters }) {
      return services.exporter.create({}, {
        query: {
          group_by: 'articles',
          format: 'csv',
          filters,
        },
      });
    },
    LOAD_SEARCH_FACETS(context, { facets, limit = 5, offset = 0 } = {}) {
      const query = {
        facets,
        filters: context.getters.getSearch.getFilters(),
        group_by: context.state.groupBy,
        limit,
        offset,
      };
      console.info('Search/LOAD_SEARCH_FACETS query:', query);
      return services.searchFacets.find({
        query,
      }).then((results) => {
        results.data.forEach((facet) => {
          context.commit('UPDATE_FACET', facet);
        });
      });
    },
    GET_SEARCH_RESULTS({ state }, { groupBy, orderBy, page, limit, filters = [], facets = [], } = {}) {
      const query = {
        filters,
        facets,
        group_by: groupBy || state.groupBy,
        page: page || state.paginationCurrentPage,
        limit: limit || state.paginationPerPage,
        order_by: orderBy || state.orderBy,
      };
      return services.search.find({
        query,
      }).then((res) => {
        if (query.groupBy === 'articles') {
          res.data = res.data.map(result => new Article(result));
        }
        return res;
      });
    },
    SEARCH({ state, dispatch, commit, getters }, { filters = [], page } = {}) {
      commit('UPDATE_IS_LOADING', true);
      const facets = ['year', 'language', 'newspaper', 'type', 'country', 'topic'];
      const query = {
        // concat temporary filters, if any
        filters: getters.getSearch.getFilters().concat(filters),
        facets,
        group_by: state.groupBy,
        page: page || state.paginationCurrentPage,
        limit: state.paginationPerPage,
        order_by: state.orderBy,
      };

      return services.search.find({
        query,
      }).then((res) => {
        commit('UPDATE_IS_LOADING', false);
        commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));
        commit('UPDATE_PAGINATION_TOTAL_ROWS', {
          paginationTotalRows: res.total,
        });

        if (this.state.user.userData) {
          const itemuids = res.data.map(item => item.uid);

          if (state.facets.find(f => f.type === 'collection').numBuckets > 0) {
            services.collectionsItems.find({
              query: { item_uids: itemuids, limit: 100 },
            }).then((cs) => {
              state.results.forEach((re) => {
                cs.data.forEach((c) => {
                  if (c.itemId === re.uid) {
                    re.collections = c.collections;
                  }
                });
              });
              // console.log(state.results);
            });
          }
        }

        commit('UPDATE_QUERY_COMPONENTS', res.info.queryComponents);
        // register facets
        if (res.total) {
          facets.forEach((type) => {
            if (res.info.facets[type]) {
              commit('UPDATE_FACET', {
                type,
                buckets: res.info.facets[type].buckets,
                numBuckets: res.info.facets[type].numBuckets,
              });
            }
          });
        }
      }).then(() => Promise.all([
        // launch search facets
        dispatch('LOAD_SEARCH_FACETS', {
          facets: [
            'person',
            'location',
          ],
        }),
        // if there's a user
        dispatch('LOAD_SEARCH_FACETS', {
          facets: [
            'collection',
          ],
        }),
        dispatch('LOAD_SEARCH_FACETS', {
          facets: [
            'accessRight',
            'partner',
          ],
        }),
      ].filter(d => d)))
        .catch((err) => {
          console.error('ERROR in "$store.search/SEARCH" services.search:', err);
        })
        .finally(() => {
          commit('UPDATE_IS_LOADING', false);
        });
    },
    UPDATE_QUERY_COMPONENTS({ commit }, components) {
      commit('UPDATE_QUERY_COMPONENTS', components);
    },
    RESET_FILTER({ commit }, { type }) {
      commit('RESET_FILTER', type);
    },
    ADD_FILTER({ commit }, { filter }) {
      commit('ADD_FILTER', filter);
    },
    REMOVE_FILTER({ commit }, { filter }) {
      commit('REMOVE_FILTER', filter);
    },
    UPDATE_FILTER({ commit }, message) {
      commit('UPDATE_FILTER', message);
    },
    UPDATE_FILTER_ITEM({ commit }, message) {
      commit('UPDATE_FILTER_ITEM', message);
    },
    MERGE_FILTER_AT_INDEX({ commit }, message) {
      commit('MERGE_FILTER_AT_INDEX', message)
    },
    LOAD_TIMELINE(context, { filters = [], granularity = 'year' } = {}) {
      return services.searchFacets.get(granularity, {
        query: {
          filters,
          // group_by: 'articles',
          limit: 500,
        },
      }).then(res => Helpers.timeline.fromBuckets(res.buckets));
    },
    LOAD_ARTICLES(context, {
      page = 1,
      limit = 10,
      filters = [],
      orderBy = '-relevance',
    } = {}) {
      return services.search.find({
        query: {
          page,
          limit,
          filters,
          order_by: orderBy,
          group_by: 'articles',
        },
      }).then(res => ({
        ...res,
        data: res.data.map(d => new Article(d)),
      }));
    },
    INIT({ state, commit }) {
      if (state.currentSearchIsPristine) {
        const { filters } = protobuf.searchQuery.deserialize(state.currentSearchHash);
        if (Array.isArray(filters)) {
          commit('UPDATE_SEARCH_IS_PRISTINE', true);
          commit('INITIALIZE_FILTERS', filters);
        }
        console.info('search/INIT, initial searchQuery instance:', state.search);
      } else {
        console.warn('search/INIT already initialized, skip.');
      }
    },
  },
};
