import * as services from '@/services';
import Collection from '@/models/Collection';

export default {
  namespaced: true,
  state: {
    collections: [],
    collectionsSortOrder: '-modified',
  },
  getters: {
    collections(state) {
      return state.collections.map(c => new Collection(c));
    },
    collectionsSortOrder(state) {
      return state.collectionsSortOrder;
    },
  },
  mutations: {
    UPDATE_COLLECTIONS(state, collections) {
      state.collections = collections;
    },
    SET_COLLECTIONS_SORT_ORDER(state, payload) {
      const collectionsSortOrder = payload.collectionsSortOrder || state.collectionsSortOrder;

      function sortBy(data, field, order) {
        data.sort((a, b) => {
          if (a[field] < b[field]) {
            return order === 'asc' ? -1 : 1;
          } else if (a[field] > b[field]) {
            return order === 'asc' ? 1 : -1;
          }
          return 0;
        });
        return data;
      }

      switch (collectionsSortOrder) {
        case '-created':
          sortBy(state.collections, 'creationTime', 'desc');
          break;
        case 'created':
          sortBy(state.collections, 'creationTime', 'asc');
          break;
        case '-modified':
          sortBy(state.collections, 'lastModifiedTime', 'desc');
          break;
        case 'modified':
          sortBy(state.collections, 'lastModifiedTime', 'asc');
          break;
        case '-name':
          sortBy(state.collections, 'name', 'desc');
          break;
        case 'name':
          sortBy(state.collections, 'name', 'asc');
          break;
        default:
          break;
      }

      state.collectionsSortOrder = collectionsSortOrder;
    },
  },
  actions: {
    LOAD_COLLECTIONS(context) {
      return new Promise((resolve) => {
        services.collections.find({
          query: {
            limit: 0,
          },
        }).then((results) => {
          context.commit('UPDATE_COLLECTIONS', results.data.map(result => new Collection({
            countArticles: result.count_articles,
            countEntities: result.count_entities,
            countIssues: result.count_issues,
            countPages: result.count_pages,
            creationDate: result.creation_date,
            creationTime: result.creation_time,
            lastModifiedDate: result.last_modified_date,
            lastModifiedTime: result.last_modified_time,
            ...result,
          })));
          context.commit('SET_COLLECTIONS_SORT_ORDER', {});
          resolve(results);
        });
      });
    },
    EDIT_COLLECTION(context, payload) {
      return new Promise((resolve) => {
        services.collections.patch(payload.uid, {
          name: payload.name,
          description: payload.description,
        }).then(res => resolve(res));
      });
    },
    ADD_COLLECTION(context, payload) {
      return new Promise((resolve) => {
        services.collections.create({
          name: payload.name,
          description: payload.description,
        }).then(res => resolve(res));
      });
    },
    DELETE_COLLECTION(context, uid) {
      return new Promise((resolve) => {
        services.collections.remove(uid).then(res => resolve(res));
      });
    },
  },
};
