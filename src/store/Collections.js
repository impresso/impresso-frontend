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
      return state.collections.map((collection) => {
        if (collection instanceof Collection) {
          return collection;
        }

        return new Collection(collection);
      });
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
        return data.sort((a, b) => {
          if (typeof a[field] === 'string') {
            if (a[field].toLowerCase() < b[field].toLowerCase()) {
              return order === 'asc' ? -1 : 1;
            } else if (a[field].toLowerCase() > b[field].toLowerCase()) {
              return order === 'asc' ? 1 : -1;
            }
            return 0;
          }
          if (a[field] < b[field]) {
            return order === 'asc' ? -1 : 1;
          } else if (a[field] > b[field]) {
            return order === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }

      switch (collectionsSortOrder) {
        case '-created':
          sortBy(state.collections, 'creationDate', 'desc');
          break;
        case 'created':
          sortBy(state.collections, 'creationDate', 'asc');
          break;
        case '-modified':
          sortBy(state.collections, 'lastModifiedDate', 'desc');
          break;
        case 'modified':
          sortBy(state.collections, 'lastModifiedDate', 'asc');
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
    LOAD_COLLECTION(context, collection) {
      return Promise.all([
        services.collections.get(collection.uid, {}),
        services.collectionsItems.find({
          query: {
            collection_uid: collection.uid,
            resolve: 'item',
          },
        }),
      ]).then((results) => {
        const loadedCollection = new Collection(results[0]);
        loadedCollection.items = results[1].data;

        return loadedCollection;
      });
    },
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
            lastModifiedDate: result.last_modified_date,
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
    ADD_COLLECTION_ITEM(context, {
      item,
      collection,
      contentType,
    }) {
      return services.collectionsItems.create({
        collection_uid: collection.uid,
        items: [{
          content_type: contentType,
          uid: item.uid,
        }],
      });
    },
    REMOVE_COLLECTION_ITEM(context, {
      item,
      collection,
    }) {
      const contentType = item.constructor.name.toLowerCase();

      return services.collectionsItems.remove(null, {
        query: {
          collection_uid: collection.uid,
          items: [{
            content_type: contentType,
            uid: item.uid,
          }],
        },
      });
    },
  },
};
