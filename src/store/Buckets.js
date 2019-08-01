import * as services from '@/services';

const SERVICE_BY_FACET = {
  person: 'entities',
  location: 'entities',
  topic: 'topics',
  newspaper: 'newspapers',
};

export default {
  namespaced: true,
  state: {
    orderBy: 'name',
    groupBy: 'articles',
    isLoading: false,
    items: [],
    searchables: Object.keys(SERVICE_BY_FACET),
    query: '',
    pagination: {
      perPage: 6,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    SET_BUCKETS(state, buckets) {
      state.items = buckets;
    },
    SET_IS_LOADING(state, value) {
      state.isLoading = Boolean(value);
    },
    UPDATE_ITEMS(state, items) {
      state.items = items;
    },
    // UPDATE_ORDER_BY(state, orderBy) {
    //   state.orderBy = orderBy;
    // },
    UPDATE_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.pagination.currentPage = parseInt(currentPage, 10);
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, totalRows) {
      console.log('totalrows', totalRows);
      state.pagination.totalRows = parseInt(totalRows, 10);
    },
  },
  actions: {
    LOAD_BUCKETS({ state, getters, commit }, { facet, q = '', orderBy = 'name' } = {}) {
      commit('SET_IS_LOADING', true);
      console.log(facet, q, orderBy);

      if (q && SERVICE_BY_FACET[facet]) {
        return services[SERVICE_BY_FACET[facet]].find({
          query: {
            q,
            order_by: orderBy,
          },
        }).then((res) => {
          console.log('Q', res);
          commit('SET_IS_LOADING', false);
          commit('UPDATE_PAGINATION_TOTAL_ROWS', res.total);
          commit('SET_BUCKETS', res.data);
        }).catch((err) => {
          console.error(err);
          commit('SET_IS_LOADING', false);
        });
      }

      // get all buckets by facet type
      return services.searchFacets.get(facet, {
        query: {
          // filters: [],
          group_by: state.groupBy,
          limit: state.pagination.perPage,
          skip: (state.pagination.currentPage - 1) * state.pagination.perPage,
        },
      }).then((res) => {
        console.log('res', res);
        commit('SET_IS_LOADING', false);
        commit('UPDATE_PAGINATION_TOTAL_ROWS', res[0].numBuckets);
        commit('UPDATE_ITEMS', res[0].buckets);
      }).catch((err) => {
        console.error(err);
        commit('SET_IS_LOADING', false);
      });
    },
  },
};
