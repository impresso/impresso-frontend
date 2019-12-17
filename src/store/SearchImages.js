import * as services from '@/services';
import Image from '@/models/Image';
import QueryComponent from '@/models/QueryComponent';
import SearchQuery from '@/models/SearchQuery';
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
    facets: [
      new Facet({
        type: 'year',
      }),
      new Facet({
        type: 'newspaper',
      }),
    ],
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
        if (result instanceof Image) {
          return result;
        }

        return new Image(result);
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
        p: context.state.paginationCurrentPage,
        o: context.state.orderBy,
      };
      const filters = context.state.search.getFilters();

      if (filters.length) {
        query.f = JSON.stringify(filters);
      }

      if (context.state.similarToUploaded) {
        query.u = context.state.similarToUploaded;
      } else if (context.state.similarTo) {
        query.i = context.state.similarTo;
      }
      // check if query has changed.
      // if (router.currentRoute.name === 'searchImages' && JSON.stringify(router.currentRoute.query) === JSON.stringify(query)) {
      //   console.info('@PUSH_SEARCH_PARAMS: same route as before, do nothing.');
      // } else {
      //   console.info('@PUSH_SEARCH_PARAMS: printing url...', query);
      //   router.push({ name: 'searchImages', query });
      // }
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
    UPDATE_FILTER({ commit }, message) {
      commit('UPDATE_FILTER', message);
    },
    SEARCH({ state, commit, getters }, { filters = [] } = {}) {
      const query = {
        filters: getters.getSearch.getFilters().concat(filters),
        facets: state.facetTypes,
        group_by: state.groupBy,
        page: state.paginationCurrentPage,
        limit: state.paginationPerPage,
        order_by: state.orderBy,
        similarTo: state.similarTo,
        similarToUploaded: state.similarToUploaded,
      };
      return services.images.find({
        query,
      }).then((res) => {
        commit('UPDATE_RESULTS', res.data.map(result => new Image(result)));
        commit('UPDATE_PAGINATION_TOTAL_ROWS', {
          paginationTotalRows: res.total,
        });
        commit('UPDATE_QUERY_COMPONENTS', res.info.queryComponents);
        // update facets
        if (res.total) {
          state.facetTypes.forEach((type) => {
            if (res.info.facets[type]) {
              commit('UPDATE_FACET', {
                type,
                buckets: res.info.facets[type].buckets,
                numBuckets: res.info.facets[type].numBuckets,
              });
            }
          });
        }
      });
    },
  },
};
