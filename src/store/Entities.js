import * as services from '@/services';
import Entity from '@/models/Entity';


export default {
  namespaced: true,
  state: {
    orderBy: 'name',
    entities: [],
    query: '',
    pagination: {
      perPage: 100,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    UPDATE_ENTITIES(state, entities) {
      state.entities = entities;
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
            limit: context.state.pagination.perPage,
            order_by: context.state.orderBy,
            page: context.state.pagination.currentPage,
          },
        }).then((results) => {
          context.commit('UPDATE_ENTITIES', results.data.map(result => new Entity({
            id: result.id,
            name: result.name,
            type: result.type,
            wikidataId: result.wikidataId,
            dbpediaURL: result.dbpediaURL,
            impressoId: result.impressoId,
            countItems: result.countItems,
            countMentions: result.countMentions,
            wikidata: result.wikidata,
            ...result,
          })));
          resolve(results);
        });
      });
    },
  },
};
