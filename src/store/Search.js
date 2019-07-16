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
          facet.setBuckets(buckets.sort((a, b) => parseInt(a.val, 10) - parseInt(b.val, 10)));
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
      const filters = payload.filters || context.getters.getSearch.getFilters();
      console.log('filters', filters);
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
    LOAD_SEARCH_FACETS(context, facets) {
      return services.searchFacets.get(facets.join(','), {
        query: {
          filters: context.getters.getSearch.getFilters(),
          group_by: context.state.groupBy,
        },
      }).then((results) => {
        results.forEach((facet) => {
          context.commit('UPDATE_FACET', facet);
        });
      });
    },
    SEARCH(context) {
      context.commit('UPDATE_IS_LOADING', true);
      const facets = ['year', 'language', 'newspaper', 'type', 'country', 'collection', 'topic'];
      const query = {
        filters: context.getters.getSearch.getFilters(),
        facets,
        group_by: context.state.groupBy,
        page: context.state.paginationCurrentPage,
        limit: context.state.paginationPerPage,
        order_by: context.state.orderBy,
      };
      console.log('-> action:SEARCH', query);

      return services.search.find({
        query,
      }).then((res) => {
        context.commit('UPDATE_IS_LOADING', false);
        context.commit('UPDATE_RESULTS', res.data.map(result => new Article(result)));
        context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
          paginationTotalRows: res.total,
        });
        context.commit('UPDATE_QUERY_COMPONENTS', res.info.queryComponents);
        // register facets
        facets.forEach((type) => {
          console.log(' ... update facet', type, res.info.facets[type]);
          context.commit('UPDATE_FACET', {
            type,
            buckets: res.info.facets[type].buckets,
          });
        });
        // launch search facets
        context.dispatch('LOAD_SEARCH_FACETS', [
          'person',
          'location',
        ]);
      }).catch((err) => {
        console.error(err);
        context.commit('UPDATE_IS_LOADING', false);
      });
    },
  },
};
