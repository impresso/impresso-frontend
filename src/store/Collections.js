import * as services from '@/services';
import Collection from '@/models/Collection';
import Article from '@/models/Article';
import Entity from '@/models/Entity';
import Issue from '@/models/Issue';
import Page from '@/models/Page';

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
    UPDATE_COLLECTION(state, payload) {
      const index = state.collections.findIndex(collection => collection.uid === payload.uid);
      state.collections.splice(index, 1, new Collection(payload));
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
    LOAD_COLLECTION(context, collection) {
      return new Promise((resolve) => {
        services.collections.get(collection.uid, {}).then((result) => {
          collection = new Collection({
            countArticles: result.count_articles,
            countEntities: result.count_entities,
            countIssues: result.count_issues,
            countPages: result.count_pages,
            creationDate: result.creation_date,
            creationTime: result.creation_time,
            lastModifiedDate: result.last_modified_date,
            lastModifiedTime: result.last_modified_time,
            ...result,
          });
          context.commit('UPDATE_COLLECTION', collection);
          resolve(collection);
        });
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
    ADD_COLLECTION_ITEM(context, payload) {
      const collection = payload.collection;
      const item = payload.item;

      let label = false;

      if (item instanceof Page) {
        label = 'page';
      } else if (item instanceof Article) {
        label = 'article';
      } else if (item instanceof Entity) {
        label = 'entity';
      } else if (item instanceof Issue) {
        label = 'issue';
      }

      if (label && collection instanceof Collection) {
        services.collectionsItems.create({
          bucket_uid: collection.uid,
          items: [{
            label,
            uid: item.uid,
          }],
        }).then((res) => {
          console.log(res);
        });
      }
    },
    REMOVE_COLLECTION_ITEM(context, payload) {
      const collection = payload.collection;
      const item = payload.item;

      let label = false;

      if (item instanceof Page) {
        label = 'page';
      } else if (item instanceof Article) {
        label = 'article';
      } else if (item instanceof Entity) {
        label = 'entity';
      } else if (item instanceof Issue) {
        label = 'issue';
      }

      if (label && collection instanceof Collection) {
        services.collectionsItems.remove(collection.uid, {
          query: {
            items: [{
              label,
              uid: item.uid,
            }],
          },
        }).then((res) => {
          console.log(res);
        });
      }
    },
  },
};
