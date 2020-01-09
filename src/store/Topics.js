import * as services from '@/services';
import Topic from '@/models/Topic';


export default {
  namespaced: true,
  state: {
    orderBy: '-name',
    topicModel: '*',
    items: [],
    itemsIndex: {},
    pagination: {
      perPage: 200,
      currentPage: 1,
      totalRows: 0,
    },
    // graph below
    graphLinks: {
      byCommonWords: [],
      byCommonArticles: [],
    },
    graphLinkMode: 'byCommonArticles',
    graphNodes: [],
  },
  mutations: {
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_TOPIC_MODEL(state, topicModel) {
      state.topicModel = topicModel;
    },
    UPDATE_ITEMS(state, items) {
      state.items = items;
      state.itemsIndex = {};
      items.forEach((d, k) => {
        state.itemsIndex[d.uid] = k;
      });
    },
    UPDATE_PAGINATION(state, pagination) {
      state.pagination = {
        ...state.pagination,
        ...pagination,
      };
    },
    UPDATE_GRAPH_LINKS(state, { byCommonWords, byCommonArticles }) {
      state.graphLinks = { byCommonWords, byCommonArticles };
    },
    UPDATE_GRAPH_NODES(state, graphNodes) {
      state.graphNodes = graphNodes;
    },
    UPDATE_GRAPH_LINK_MODE(state, mode) {
      state.graphLinkMode = mode;
    },
  },
  actions: {
    CHANGE_GRAPH_LINK_MODE({ commit }, mode) {
      commit('UPDATE_GRAPH_LINK_MODE', mode);
    },
    LOAD_TOPICS_GRAPH({ commit }) {
      return services.topics.find({
        query: {
          limit: 500,
        },
      }).then((results) => {
        // temporary hack
        // temporary hack: random connections between nodes...
        const graphNodes = [];
        const byCommonWords = [];
        const byCommonArticles = [];
        // console.info('link type', linkType, results.data.length);
        const limit = 25;
        const minWordsIncommon = 3;

        for (let i = 0, l = results.data.length; i < l; i += 1) {
          const t = new Topic(results.data[i]);
          const relatedIndex = {};
          // remap relatedTopics
          t.relatedTopics.forEach((d) => {
            relatedIndex[d.uid] = d.w;
          });
          t.id = t.uid;
          t.degree = 0;

          for (let j = i + 1; j < l; j += 1) {
            if (relatedIndex[results.data[j].uid]) {
              byCommonArticles.push({
                id: [i, j].join('-'),
                source: i,
                target: j,
                w: relatedIndex[results.data[j].uid],
              });
            }
            const common = results.data[i].words
              .filter((wi, k) => k < limit && results.data[j].words
                .filter((wj, kj) => kj < limit)
                .find(wj => wi.w === wj.w));
            if (common.length > minWordsIncommon - 1) {
              // console.info('combine', i, j, common);
              byCommonWords.push({
                id: [i, j].join('-'),
                source: i,
                target: j,
                w: common.length,
                c: common,
              });
              t.degree += 1;
            }
          }

          graphNodes.push(t);
        }

        commit('UPDATE_GRAPH_LINKS', {
          byCommonArticles,
          byCommonWords,
        });
        commit('UPDATE_GRAPH_NODES', graphNodes);
        // console.info('links', links);
        return {
          nodes: graphNodes,
          links: {
            byCommonArticles,
            byCommonWords,
          },
        };
      });
    },
    LOAD_TOPICS({ commit }, {
      page = 1,
      limit,
      q,
      facets,
      filters = [],
    } = {}) {
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

      if (limit) {
        commit('UPDATE_PAGINATION', {
          perPage: limit,
        });
      }

      return services.topics.find({
        query,
      }).then((res) => {
        const data = res.data.map(d => new Topic(d, {
          highlight: query.q ? q.split('*').join('') : '',
        }));
        commit('UPDATE_ITEMS', data);
        commit('UPDATE_PAGINATION', {
          currentPage: page,
          totalRows: res.total,
        });
        return {
          ...res,
          data,
        };
      });
    },
    LOAD_TOPIC(context, uid) {
      return services.topics.get(uid, {
        fl: 'id',
      }).then(result => new Topic(result));
    },
  },
};
