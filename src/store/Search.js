import * as services from '@/services';
import Article from '@/models/Article';
// import Bucket from '@/models/Bucket';
// import Topic from '@/models/Topic';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
// import Newspaper from '@/models/Newspaper';
// import Collection from '@/models/Collection';
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
    facets: [
      new Facet({
        type: 'year',
      }),
      new Facet({
        type: 'type',
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
        type: 'collection',
      }),
    ],
    facetTypes: ['person', 'location', 'year', 'newspaper', 'language', 'topic', 'collection'], // this also sets the order of the filters
    orderBy: '-relevance', // relevance, -relevance, date, -date
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
  },
  actions: {
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS({ state, commit }, { routeName = 'search', page = 0 } = {}) {
      if (page > 0) {
        commit('UPDATE_PAGINATION_CURRENT_PAGE', page);
      }
      const query = {
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
      if (query.o && ['-relevance', 'relevance', 'date', '-date'].indexOf(query.o) !== -1) {
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
        console.warn('ADD_FILTER_TO_CURRENT_SEARCH', filter);
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
    LOAD_SEARCH_FACETS(context, { facets, limit = 5, skip = 0 } = {}) {
      return services.searchFacets.get(facets.join(','), {
        query: {
          filters: context.getters.getSearch.getFilters(),
          group_by: context.state.groupBy,
          limit,
          skip,
        },
      }).then((results) => {
        results.forEach((facet) => {
          context.commit('UPDATE_FACET', facet);
        });
      });
    },
    GET_SEARCH_RESULTS({ state }, { groupBy, orderBy, page, limit, filters = [] } = {}) {
      const query = {
        filters,
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
    SEARCH({ state, dispatch, commit, getters }, { filters = [] } = {}) {
      commit('UPDATE_IS_LOADING', true);
      const facets = ['year', 'language', 'newspaper', 'type', 'country', 'topic'];
      const query = {
        // concat temporary filters, if any
        filters: getters.getSearch.getFilters().concat(filters),
        facets,
        group_by: state.groupBy,
        page: state.paginationCurrentPage,
        limit: state.paginationPerPage,
        order_by: state.orderBy,
      };

      return Promise.all([
        services.search.find({
          query,
        }).then((res) => {
          const itemuids = res.data.map(item => item.uid);
          // console.log(itemuids, res.data);

          services.collectionsItems.find({
            query: { item_uids: itemuids, limit: 100 },
          }).then((cs) => {
            // const items = res.data;
            // const colls = {};
            // rs.data.forEach((r) => {
            //   colls.collections = r.collections;
            //   // delete (coll.collectionIds);
            //   // delete (coll.contentType);
            //   // delete (coll.itemId);
            //   // delete (coll.latestDateAdded);
            //   // delete (coll.searchQueries);
            // });
            res.data.forEach((re) => {
              cs.data.forEach((c) => {
                if (c.itemId === re.uid) {
                  re.collections = c.collections;
                }
              });
              // find(item => (item.itemId === re.uid) && item);
            });
            //
            // const mergeById = (a1, a2) =>
            //   a1.map(itm => ({
            //     ...a2.find(item => (item.itemId === itm.uid) && item),
            //     ...itm,
            //   }));
            // console.log(mergeById(items, colls));

            commit('UPDATE_IS_LOADING', false);
            commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));
            commit('UPDATE_PAGINATION_TOTAL_ROWS', {
              paginationTotalRows: res.total,
            });
          });


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
        }).catch((err) => {
          console.error('ERROR in "$store.search/SEARCH" services.search:', err);
        }).finally(() => {
          commit('UPDATE_IS_LOADING', false);
        }),
        // launch search facets
        dispatch('LOAD_SEARCH_FACETS', {
          facets: [
            'person',
            'location',
          ],
        }),
        dispatch('LOAD_SEARCH_FACETS', {
          facets: [
            'collection',
          ],
        }),
      ]);
    },
  },
};
