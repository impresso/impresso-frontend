import * as services from '@/services';
import Entity from '@/models/Entity';

export default {
  namespaced: true,
  state: {
    orderBy: 'name',
    items: [],
    query: '',
    pagination: {
      perPage: 10,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    UPDATE_QUERY(state, query) {
      state.query = query;
      console.info('update q', query);
    },
    UPDATE_ENTITIES(state, items) {
      state.items = items;
    },
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_PAGINATION(state, pagination) {
      state.pagination = {
        ...state.pagination,
        ...pagination,
      };
    },
  },
  actions: {
    LOAD_ENTITIES({ state, commit }, { page = 1, q = '' } = {}) {
      console.info('entities/LOAD_ENTITIES loading:', page);
      commit('UPDATE_PAGINATION', {
        currentPage: page,
      });
      const query = {
        limit: state.pagination.perPage,
        order_by: state.orderBy,
        page: state.pagination.currentPage,
      };
      if (q.length) {
        query.q = q.split('*').concat(['*']).join('');
      }
      return services.entities.find({
        query,
      }).then((res) => {
        console.info('entities/LOAD_ENTITIES', res);
        const items = res.data.map(result => new Entity({
          ...result,
        }));
        commit('UPDATE_ENTITIES', items);
        commit('UPDATE_PAGINATION', {
          totalRows: res.total,
        });
        return items;
      });
    },
    LOAD_DETAIL(context, entityId) {
      return services.entities.get(entityId, {}).then((res) => {
        console.info('entities/LOAD_DETAIL success:', res);
        return new Entity(res);
      });
    },
    LOAD_TIMELINE() {
      return services.search.find({
        query: {
          facets: 'year',
          group_by: 'articles',
          limit: 0,
        },
      }).then((res) => {
        console.info('entities/LOAD_TIMELINE success:', res);
        if (!res.info.facets && !res.info.facets.year) {
          return [];
        }
        const values = res.info.facets.year.buckets.map(bucket => ({
          t: bucket.val,
          w: bucket.count,
        })).sort((a, b) => parseInt(a.t, 10) - parseInt(b.t, 10));
        return this.$helpers.timeline.addEmptyYears(values);
      });
    },
  },
};
