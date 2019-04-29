import * as services from '@/services';
import Image from '@/models/Image';
import router from '../router';

export default {
  namespaced: true,
  state: {
    results: [],
    orderBy: '-relevance', // relevance, -relevance, date, -date
  },
  getters: {
    results(state) {
      return state.results.map((result) => {
        if (result instanceof Image) {
          return result;
        }

        return new Image(result);
      });
    },
  },
  mutations: {
    UPDATE_SEARCH_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    CLEAR_RESULTS(state) {
      state.results = [];
    },
    UPDATE_RESULTS(state, results) {
      state.results = results;
    },
  },
  actions: {
    /**
     * Print search params to current URL
     * @param {[type]} context [description]
     */
    PUSH_SEARCH_PARAMS(context) {
      const query = {
        f: JSON.stringify(context.state.searchImages),
        o: context.state.orderBy,
      };
      console.log('@PUSH_SEARCH_PARAMS', query);
      router.push({
        name: 'search',
        query,
      });
    },
    PULL_SEARCH_PARAMS(context, query) {
      if (query.o && ['-relevance', 'relevance', 'date', '-date'].indexOf(query.o) !== -1) {
        context.commit('UPDATE_SEARCH_ORDER_BY', query.o);
      }
      console.log('@PULL_SEARCH_PARAMS', query);

      // parse filters here.
      try {
        context.commit('UPDATE_SEARCH_QUERY_FILTERS', JSON.parse(query.f));
      } catch (err) {
        console.log(err);
      }
      context.dispatch('SEARCH');
    },
    SEARCH(context) {
      const search = new Promise(
        (resolve, reject) => {
          const query = {
            filters: context.getters.getSearch.getFilters(),
            page: context.state.paginationCurrentPage,
            limit: context.state.paginationPerPage,
            order_by: context.state.orderBy,
          };
          console.log('->action:SEARCH', query);
          services.search.find({
            query,
          }).then(
            (res) => {
              context.commit('UPDATE_RESULTS', res.data.map(result => new Image(result)));

              // add topic facet/filter
              if (res.info.facets && res.info.facets.topic) {
                const facet = new Facet({
                  type: 'topic',
                  operators: ['OR', 'AND'],
                  buckets: res.info.facets.topic.buckets.map(bucket => ({
                    ...bucket,
                    item: new Topic({
                      ...bucket.item,
                      uid: bucket.val,
                    }),
                  })),
                });
              }
              context.commit('UPDATE_PAGINATION_TOTAL_ROWS', {
                paginationTotalRows: res.total,
              });
            },
            (err) => {
              reject(err);
            },
          );
        },
      );

      return search;
    },
  },
};
