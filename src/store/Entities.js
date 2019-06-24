import * as services from '@/services';
import Entity from '@/models/Entity';


export default {
  namespaced: true,
  state: {
    orderBy: 'name',
    entities: [],
    query: '',
    pagination: {
      perPage: 2,
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
    UPDATE_ENTITIES(state, entities) {
      state.entities = entities;
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
      return new Promise((resolve) => {
        services.entities.find({
          query: {
            q: context.state.query,
            limit: context.state.pagination.perPage,
            orderby: context.state.orderBy,
            page: context.state.pagination.currentPage,
          },
        }).then((results) => {
          context.commit('UPDATE_ENTITIES', results.data.map(result => new Entity({
            // id: result.id,
            // name: result.name,
            // type: result.type,
            // wikidataId: result.wikidataId,
            // dbpediaURL: result.dbpediaURL,
            // impressoId: result.impressoId,
            // countItems: result.countItems,
            // countMentions: result.countMentions,
            // wikidata: result.wikidata,
            ...result,
          })));
          context.state.pagination.totalRows = results.total;
          resolve(results);
        });
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
