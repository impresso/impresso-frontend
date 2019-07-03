import * as services from '@/services';
import Entity from '@/models/Entity';


export default {
  namespaced: true,
  state: {
    orderBy: 'name',
    items: [],
    query: '',
    pagination: {
      perPage: 12,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    UPDATE_QUERY(state, query) {
      state.query = query;
      console.log('update q', query);
    },
    UPDATE_ENTITIES(state, items) {
      state.items = items;
    },
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.pagination.currentPage = parseInt(currentPage, 10);
    },
  },
  actions: {
    LOAD_ENTITIES(context) {
      return services.entities.find({
        query: {
          q: context.state.query,
          limit: context.state.pagination.perPage,
          orderby: context.state.orderBy,
          page: context.state.pagination.currentPage,
        },
      }).then((res) => {
        const items = res.data.map(result => new Entity({
          ...result,
        }));
        context.commit('UPDATE_ENTITIES', items);
        context.state.pagination.totalRows = res.total;
        return items;
      });
    },
    LOAD_DETAIL(context, entityId) {
      return new Promise((resolve, reject) => {
        services.entities.get(entityId, {})
          .then(res => resolve(res))
          .catch(reject);
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
        if (!res.info.facets && !res.info.facets.year) {
          return [];
        }
        return res.info.facets.year.buckets.map(bucket => ({
          t: bucket.val,
          w: bucket.count,
        })).sort((a, b) => parseInt(b.t, 10) - parseInt(a.t, 10));
      });
    },
  },
};
