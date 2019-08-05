import * as services from '@/services';
import Bucket from '@/models/Bucket';

const SERVICE_BY_FACET_TYPE = {
  person: 'entities',
  location: 'entities',
  topic: 'topics',
  newspaper: 'newspapers',
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
    typeOptions: ['location', 'country', 'person', 'language', 'topic'],
    buckets: [],
    searchables: Object.keys(SERVICE_BY_FACET_TYPE),
    query: '',
    pagination: {
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
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
      dispatch('LOAD_BUCKETS');
    },
    CHANGE_Q({ commit, dispatch }, q) {
      commit('UPDATE_Q', q);
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      dispatch('LOAD_BUCKETS');
    },
    CHANGE_TYPE({ commit, dispatch }, type) {
      commit('SET_TYPE', type);
      commit('UPDATE_ORDER_BY', 'name');
      // When changing type, we have to reset the list of buckets
      commit('UPDATE_BUCKETS', []);
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      // then search again with the new params
      dispatch('LOAD_BUCKETS');
    },
    CHANGE_ORDER_BY({ commit, dispatch }, orderBy) {
      console.log(orderBy);
      commit('UPDATE_ORDER_BY', orderBy);
      commit('UPDATE_BUCKETS', []);
      commit('UPDATE_PAGINATION_CURRENT_PAGE', 1);
      dispatch('LOAD_BUCKETS');
    },
    LOAD_BUCKETS({ state, getters, commit }, {
      filters = [],
    } = {}) {
      commit('SET_IS_LOADING', true);
      const type = state.type;
      // if there is a service, e.g. for topics or entities
      if (SERVICE_BY_FACET_TYPE[type]) {
        return services[SERVICE_BY_FACET_TYPE[type]].find({
          query: {
            q: state.fq,
            filters,
            page: state.pagination.currentPage,
            limit: state.pagination.perPage,
            order_by: state.orderBy,
          },
        }).then((res) => {
          commit('UPDATE_PAGINATION_TOTAL_ROWS', res.total);
          commit('UPDATE_BUCKETS', res.data.map(item => new Bucket({
            val: item.uid,
            item,
            type,
          })));
        }).catch((err) => {
          console.error(err);
        }).finally(() => {
          commit('SET_IS_LOADING', false);
        });
      }

      // otherwise, we just get all buckets by facet type
      return services.searchFacets.get(type, {
        query: {
          group_by: state.groupBy,
          page: state.pagination.currentPage,
          limit: state.pagination.perPage,
          order_by: state.orderBy,
        },
      }).then((res) => {
        commit('UPDATE_PAGINATION_TOTAL_ROWS', res[0].numBuckets);
        commit('UPDATE_BUCKETS', res[0].buckets.map(d => new Bucket(d)));
      }).catch((err) => {
        console.error(err);
      }).finally(() => {
        commit('SET_IS_LOADING', false);
      });
    },
  },
};
