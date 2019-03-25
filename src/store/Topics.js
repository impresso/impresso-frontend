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
          // temporary hack
          // temporary hack: random connections between nodes...
          const links = [];
          const nodes = [];

          // console.log('link type', linkType, results.data.length);
          const limit = 25;
          const minWordsIncommon = 2;

          for (let i = 0, l = results.data.length; i < l; i += 1) {
            const t = new Topic(results.data[i]);

            t.id = t.uid;
            t.degree = 0;

            for (let j = i + 1; j < l; j += 1) {
              const common = results.data[i].words
                .filter((wi, k) => k < limit && results.data[j].words
                  .filter((wj, kj) => kj < limit)
                  .find(wj => wi.w === wj.w));
              if (common.length > minWordsIncommon - 1) {
                // console.log('combine', i, j, common);
                links.push({
                  id: [i, j].join('-'),
                  source: i,
                  target: j,
                  w: common.length,
                  c: common,
                });
                t.degree += 1;
              }
            }

            nodes.push(t);
          }
          // console.log('links', links);

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
        if (q && q.length > 1) {
          query.q = `${q.split('*').join('')}*`;
        }
        if (facets) {
          query.facets = facets;
        }
        // console.log('topics to load', query);

        services.topics.find({
          query,
        }).then((res) => {
          resolve({
            ...res,
            data: res.data.map(d => new Topic(d, {
              highlight: query.q ? q.split('*').join('') : '',
            })),
          });
        });
      });
    },
    LOAD_ARTICLES(context, {
      topicUid,
      page,
      limit,
      filters = [],
      orderBy = '-relevance',
    } = {}) {
      return new Promise((resolve) => {
        const query = {
          group_by: 'articles',
          page,
          limit,
          order_by: orderBy,
          facets: ['topic', 'newspaper'],
          filters: [
            {
              type: 'topic',
              context: 'include',
              q: topicUid,
            },
          ].concat(filters),
        };

        services.search.find({
          query,
        }).then((res) => {
          resolve({
            ...res,
            data: res.data.map(d => new Article(d)),
          });
        }).catch((err) => {
          console.log('error', topicUid, err);
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
