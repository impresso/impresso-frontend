import * as services from '@/services';
import Topic from '@/models/Topic';

export default {
  namespaced: true,
  state: {
    collections: [],
    collectionsSortOrder: '-modified',
  },
  actions: {
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
