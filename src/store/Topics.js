import * as services from '@/services';
import Topic from '@/models/Topic';

export default {
  namespaced: true,
  state: {
    orderBy: '-name',
  },
  mutations: {
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
  },
  actions: {
    LOAD_TOPICS() {
      return new Promise((resolve) => {
        services.topics.find({
          query: {
            limit: 150,
          },
        }).then((results) => {
          resolve(results.data.map(result => new Topic(result)));
        });
      });
    },
    LOAD_ARTICLES(context, uid) {
      return new Promise((resolve) => {
        services.search.find({
          query: {
            group_by: 'articles',
            limit: 10,
            facets: ['year', 'topic'],
            // filters: [
            //   {
            //     type: 'topic',
            //     context: 'include',
            //     q: uid,
            //   },
            // ],
          },
        }).then((results) => {
          // wrap articles
          console.log('REULTTTTTT', uid, results);
          resolve([]);
        }).catch((err) => {
          console.log('error', uid, err);
        });
      });
    },
    LOAD_TOPIC(context, uid) {
      return new Promise((resolve) => {
        services.topics.get(uid, {
          fl: 'id',
        }).then((result) => {
          resolve(new Topic(result));
        //   collection = new Collection({
        //     countArticles: result.count_articles,
        //     countEntities: result.count_entities,
        //     countIssues: result.count_issues,
        //     countPages: result.count_pages,
        //     creationDate: result.creation_date,
        //     creationTime: result.creation_time,
        //     lastModifiedDate: result.last_modified_date,
        //     lastModifiedTime: result.last_modified_time,
        //     ...result,
        //   });
        //   context.commit('UPDATE_COLLECTION', collection);
        //   resolve(collection);
        // });
          // resolve({
          //   title: 'ohlllalalal',
          //   uid,
          // });
        });
      });
    },
  },
};
