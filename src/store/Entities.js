import * as services from '@/services';
import Entity from '@/models/Entity';
import Article from '@/models/Article';
import Mention from '@/models/Mention';
import Helpers from '@/plugins/Helpers';
import Facet from '@/models/Facet';

export default {
  namespaced: true,
  state: {
    orderBy: '-count',
    items: [],
    query: '',
    isLoading: false,
    applyCurrentSearchFilters: true,
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
    UPDATE_IS_LOADING(state, value) {
      state.isLoading = value;
    },
    UPDATE_APPLY_CURRENT_SEARCH_FILTERS(state, value) {
      state.applyCurrentSearchFilters = value;
    },
  },
  actions: {
    UPDATE_IS_LOADING({ commit }, value) {
      commit('UPDATE_IS_LOADING', value);
    },
    UPDATE_APPLY_CURRENT_SEARCH_FILTERS({ commit }, value) {
      commit('UPDATE_APPLY_CURRENT_SEARCH_FILTERS', value);
    },
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
      }).then(res => Helpers.timeline.fromBuckets(res.buckets));
    },
    LOAD_PAGE_TOPICS(context, pageId) {
      const query = {
        filters: [{
          type: 'page',
          q: pageId,
        }],
        group_by: 'articles',
      };
      return services.searchFacets.get('topic', {
        query,
      }).then((topic) => new Facet(topic));
    },
    LOAD_PAGE_ENTITIES(context, pageId) {
      const query = {
        facets: ['location', 'person'],
        filters: [{
          type: 'page',
          q: pageId,
        }],
        group_by: 'articles',
      };
      return services.searchFacets.find({
        query,
      }).then((response) => [
        new Facet(response.data[0]),
        new Facet(response.data[1]),
      ]);
    },
  },
};
