import * as services from '@/services';
import Entity from '@/models/Entity';
import Article from '@/models/Article';
import Mention from '@/models/Mention';

export default {
  namespaced: true,
  state: {
    orderBy: '-count',
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
    UPDATE_ORDER_BY({ commit }, value) {
      commit('UPDATE_ORDER_BY', value);
    },
    LOAD_ENTITIES({ state, commit }, { page = 1, q = '' } = {}) {
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
      console.info('entities/LOAD_ENTITIES loading query:', query);
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
    LOAD_ENTITY_ARTICLES(context, { page = 1, filters = [], orderBy = '-relevance' } = []) {
      const query = {
        page,
        filters,
        order_by: orderBy,
        group_by: 'articles',
      };
      return services.search.find({
        query,
      }).then(res => ({
        ...res,
        data: res.data.map(d => new Article(d)),
      }));
    },
    LOAD_ENTITY_MENTIONS(context, { page = 1, filters = [], orderBy = '-relevance', faster = 'on' } = []) {
      const query = {
        faster,
        page,
        filters,
        order_by: orderBy,
      };
      console.info('entities/LOAD_ENTITY_MENTIONS query:', query);

      return services.mentions.find({
        query,
      }).then((res) => {
        console.info('entities/LOAD_ENTITY_MENTIONS SUCCESS? receved:', res);
        return res;
      }).then(res => ({
        ...res,
        data: res.data.map((d) => {
          const mention = new Mention(d);
          if (mention.article) {
            mention.article = new Article(mention.article);
          }
          return mention;
        }),
      }));
    },
    LOAD_DETAIL(context, entityId) {
      return services.entities.get(entityId, {}).then((res) => {
        console.info('entities/LOAD_DETAIL success:', res);
        return new Entity(res);
      });
    },
    LOAD_TIMELINE(context, entityId) {
      const query = {
        filters: [{
          type: 'entity',
          q: entityId,
        }],
        group_by: 'articles',
      };
      return services.searchFacets.get('year', {
        query,
      }).then((res) => {
        console.info('entities/LOAD_TIMELINE success:', res);
        // if (!res.info.facets && !res.info.facets.year) {
        //   return [];
        // }
        // const values = res.info.facets.year.buckets.map(bucket => ({
        //   t: bucket.val,
        //   w: bucket.count,
        // })).sort((a, b) => parseInt(a.t, 10) - parseInt(b.t, 10));
        // return this.$helpers.timeline.addEmptyYears(values);
      });
    },
  },
};
