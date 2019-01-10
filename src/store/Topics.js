import * as services from '@/services';
import Article from '@/models/Article';
import Topic from '@/models/Topic';


export default {
  namespaced: true,
  state: {
    orderBy: '-name',
    topicModel: '*',
  },
  mutations: {
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_TOPIC_MODEL(state, topicModel) {
      state.topicModel = topicModel;
    },
  },
  actions: {
    LOAD_TOPICS_GRAPH() {
      return new Promise((resolve) => {
        services.topics.find({
          query: {
            limit: 500,
          },
        }).then((results) => {
          // enrich with id
          const nodes = results.data.map((result) => {
            const t = new Topic(result);
            t.id = result.uid;
            return t;
          });

          // temporary hack: random connections between nodes
          const links = [];

          nodes.forEach((t, k) => {
            // number of connections, 1 to 5:
            const degree = 1 + Math.round(Math.random() * 4);
            for (let i = 0; i < degree; i += 1) {
              const idx = Math.round(Math.random() * (nodes.length - 1));
              links.push({
                source: k,
                target: idx,
              });
            }
          });

          resolve({
            nodes,
            links,
          });
        });
      });
    },
    LOAD_TOPICS(context, {
      page = 1,
      limit,
      q,
      facets,
      filters = [],
    } = {}) {
      return new Promise((resolve) => {
        // get rid of empty
        const query = {
          limit,
          page,
        };

        if (filters.length) {
          query.filters = filters;
        }
        if (q) {
          query.q = q;
        }
        if (facets) {
          query.facets = facets;
        }
        console.log('topics to load', query);

        services.topics.find({
          query,
        }).then((res) => {
          resolve({
            ...res,
            data: res.data.map(d => new Topic(d)),
          });
        });
      });
    },
    LOAD_ARTICLES(context, uid, params = {}) {
      return new Promise((resolve) => {
        services.search.find({
          query: {
            group_by: 'articles',
            page: params.page || 1,
            facets: ['year', 'topic'],
            filters: [
              {
                type: 'topic',
                context: 'include',
                q: uid,
              },
            ],
          },
        }).then((res) => {
          // wrap articles
          console.log('REULTTTTTT', uid, res);
          resolve({
            ...res,
            data: res.data.map(d => new Article(d)),
          });
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
