import * as services from '@/services';
import Bucket from '@/models/Bucket';

const SERVICE_BY_TYPE = {
  person: 'entities',
  location: 'entities',
  topic: 'topics',
  newspaper: 'newspapers',
  collection: 'collections',
};

export default {
  namespaced: true,
  state: {
    q: '',
    fq: '',
    orderBy: 'name',
    groupBy: 'articles',
    isLoading: false,
    type: '',
    typeOptions: ['location', 'country', 'person', 'language', 'topic', 'newspaper'],
    buckets: [],
    query: '',
    pagination: {
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {
    getCurrentSearchFilters(state, getters, rootState, rootGetter) {
      return rootGetter['search/getSearch'].getFilters();
    },
  },
  mutations: {
    SET_IS_LOADING(state, value) {
      state.isLoading = Boolean(value);
    },
    SET_TYPE(state, type) {
      state.type = type;
    },
    UPDATE_Q(state, q) {
      state.q = q;
      state.fq = q.split('*').concat(['*']).join('');
    },
    UPDATE_BUCKETS(state, buckets) {
      state.buckets = buckets;
    },
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.pagination.currentPage = parseInt(currentPage, 10);
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, totalRows) {
      state.pagination.totalRows = parseInt(totalRows, 10);
    },
  },
  actions: {
    CHANGE_PAGE({ commit, dispatch }, page) {
      commit('UPDATE_PAGINATION_CURRENT_PAGE', page);
      // dispatch('LOAD_BUCKETS');
    },
    CHANGE_Q({ commit, dispatch }, q) {
      commit('UPDATE_Q', q);
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      // dispatch('LOAD_BUCKETS');
    },
    CHANGE_TYPE({ commit, dispatch }, type) {
      commit('SET_TYPE', type);
      commit('UPDATE_ORDER_BY', 'name');
      // When changing type, we have to reset the list of buckets
      commit('UPDATE_BUCKETS', []);
      commit('UPDATE_Q', '');
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      // then search again with the new params
      // dispatch('LOAD_BUCKETS');
    },
    CHANGE_ORDER_BY({ commit, dispatch }, orderBy) {
      commit('UPDATE_ORDER_BY', orderBy);
      commit('UPDATE_BUCKETS', []);
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      // dispatch('LOAD_BUCKETS');
    },
    SEARCH({ state, commit }, { q, type }) {
      if (q && q.length) {
        commit('UPDATE_Q', q);
      }

      if (type) {
        commit('SET_TYPE', type);
      }

      if (state.isLoading) {
        // cancel current query!
        return null;
      }
      commit('SET_IS_LOADING', true);
      const service = services[SERVICE_BY_TYPE[state.type]];
      const query = {
        page: state.pagination.currentPage,
        limit: state.pagination.perPage,
      };
      if (state.type === 'person') {
        query.filters = [{
          type: 'type',
          q: 'Person',
        }];
      } else if (state.type === 'location') {
        query.filters = [{
          type: 'type',
          q: 'Location',
        }];
      }
      if (state.q.length) {
        if (['newspaper', 'collection'].indexOf(state.type) > -1) {
          query.q = state.q;
        } else {
          query.q = state.fq;
        }
      }
      return service.find({
        query,
      }).then((res) => {
        commit('UPDATE_PAGINATION_TOTAL_ROWS', res.total);
        commit('UPDATE_BUCKETS', res.data.map(item => new Bucket({
          val: item.uid,
          item,
          type: state.type,
        })));
      }).catch((err) => {
        console.error(err);
        return [];
      }).finally(() => {
        commit('SET_IS_LOADING', false);
      });
    },
    SEARCH_FACETS({ state, getters, commit }, { type }) {
      commit('SET_IS_LOADING', true);
      if (type) {
        commit('SET_TYPE', type);
      }
      console.info('buckets/SEARCH_FACETS state:', state);
      // otherwise, we just get all buckets by facet type
      return services.searchFacets.get(state.type, {
        query: {
          group_by: state.groupBy,
          filters: getters.getCurrentSearchFilters,
          page: state.pagination.currentPage,
          limit: state.pagination.perPage,
          order_by: '-count',
        },
      }).then((res) => {
        commit('UPDATE_PAGINATION_TOTAL_ROWS', res[0].numBuckets);
        commit('UPDATE_BUCKETS', res[0].buckets.map(d => new Bucket({
          ...d,
          type: state.type,
        })));
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        commit('SET_IS_LOADING', false);
      });
    },
  },
};
