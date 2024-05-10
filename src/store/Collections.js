import * as services from '@/services';
import Collection from '@/models/Collection';
import Article from '@/models/Article';
import Helpers from '@/plugins/Helpers';
import Facet from '@/models/Facet';

export default {
  namespaced: true,
  state: {
    collections: [],
    collectionItems: [],
    orderBy: '-dateAdded', // dateAdded, itemDate, -itemDate
    paginationPerPage: 12,
    paginationCurrentPage: 1,
    paginationTotalRows: 0,
    collectionsOrderBy: '-date', // '-date', 'date', '-size', 'size'
    collectionsQ: '',
    collectionsPaginationPerPage: 20,
    collectionsPaginationCurrentPage: 1,
    collectionsPaginationTotalRows: 0,
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
    collectionItems(state) {
      return state.collectionItems.map((a) => {
        if (a instanceof Article) {
          return a;
        }

        return new Article(a);
      });
    },
  },
  mutations: {
    UPDATE_ITEMS_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_COLLECTIONS(state, collections) {
      state.collections = collections;
    },
    UPDATE_COLLECTION_ITEMS(state, items) {
      state.collectionItems = items;
    },
    UPDATE_PAGINATION_CURRENT_PAGE(state, page) {
      state.paginationCurrentPage = parseInt(page, 10);
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, payload) {
      state.paginationTotalRows = payload.paginationTotalRows;
    },
    UPDATE_PAGINATION_LIST_CURRENT_PAGE(state, page) {
      state.collectionsPaginationCurrentPage = parseInt(page, 10);
    },
    UPDATE_PAGINATION_LIST_TOTAL_ROWS(state, total) {
      state.collectionsPaginationTotalRows = parseInt(total, 10);
    },
    SET_COLLECTIONS_SORT_ORDER(state, orderBy) {
      state.collectionsOrderBy = orderBy;
    },
    SET_COLLECTIONS_Q(state, q) {
      state.collectionsQ = q;
    },
  },
  actions: {
    LOAD_COLLECTION(context, collection) {
      return Promise.all([
        services.collections.get(collection.uid, {}),
        services.collectionsItems.find({
          query: {
            collection_uids: [collection.uid],
            resolve: 'item',
            page: context.state.paginationCurrentPage,
            limit: context.state.paginationPerPage,
            // TODO Uncomment the following line when service is ready
            // order_by: context.state.orderBy,
          },
        }),
      ]).then((results) => {
        const loadedCollection = new Collection(results[0]);
        const articles = [];
        results[1].data.forEach((a) => {
          if (!(a.item instanceof Article)) {
            articles.push(new Article(a.item));
          }
        });
        context.commit('UPDATE_COLLECTION_ITEMS', articles);
        context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
          paginationTotalRows: results[1].total,
        });

        return loadedCollection;
      });
    },
    LOAD_COLLECTIONS_ITEMS(context) {
      return Promise.all([
        services.collectionsItems.find({
          query: {
            resolve: 'item',
            page: context.state.paginationCurrentPage,
            limit: context.state.paginationPerPage,
            // TODO Uncomment the following line when service is ready
            // order_by: context.state.orderBy,
          },
        }),
      ]).then((results) => {
        const articles = [];
        results[0].data.forEach((a) => {
          if (!(a.item instanceof Article)) {
            articles.push(new Article(a.item));
          }
        });
        context.commit('UPDATE_COLLECTION_ITEMS', articles);
        context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
          paginationTotalRows: results[0].total,
        });

        return articles;
      });
    },
    LOAD_COLLECTIONS(context) {
      // console.log(context);
      return new Promise((resolve) => {
        services.collections.find({
          query: {
            page: context.state.collectionsPaginationCurrentPage,
            limit: context.state.collectionsPaginationPerPage,
            order_by: context.state.collectionsOrderBy,
            q: context.state.collectionsQ,
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
          // context.commit('SET_COLLECTIONS_SORT_ORDER', {});
          context.commit('UPDATE_PAGINATION_LIST_TOTAL_ROWS', results.total);
          resolve(results);
        });
      });
    },
    LOAD_TIMELINE(context, collectionId) {
      const query = {
        filters: [{
          type: 'collection',
          q: collectionId,
        }],
        // group_by: 'articles',
        limit: 100000,
      };
      return services.searchFacets.get('year', {
        query,
      }).then(res => Helpers.timeline.fromBuckets(res.buckets));
    },
    LOAD_FACETS(context, payload) {
      const facetType = payload.type;
      const query = {
        filters: [{
          type: 'collection',
          q: payload.q,
        }],
        // group_by: 'articles',
      };
      return services.searchFacets.get(facetType, {
        query,
      }).then((facetType) => new Facet(facetType));
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
      return services.collections.create({
        name: payload.name,
        description: payload.description
      })
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
    ADD_COLLECTION_ITEMS(context, {
      items,
      collection,
      contentType,
    }) {
      return services.collectionsItems.create({
        collection_uid: collection.uid,
        items: items.map(item => ({
          uid: item.uid,
          content_type: contentType,
        })),
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
    REMOVE_COLLECTION_ITEMS(context, {
      items,
      collection,
    }) {
      return services.collectionsItems.remove(null, {
        query: {
          collection_uid: collection.uid,
          items: items.map(item => ({
            uid: item.uid,
          })),
        },
      });
    },
  },
};
