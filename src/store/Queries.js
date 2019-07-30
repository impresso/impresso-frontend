import SearchQuery from '@/models/SearchQuery';

const InitalQuery = new SearchQuery({
  title: 'Query 1',
  filters: [{ type: 'hasTextContents' }],
});

export default {
  namespaced: true,
  state: {
    queries: [InitalQuery], // array of queries
    query: InitalQuery, // current query
  },
  mutations: {
    NEW(state) {
      const query = new SearchQuery({
        title: `Query ${state.queries.length + 1}`,
        filters: [{ type: 'hasTextContents' }],
      });
      state.queries.unshift(query); // put the query on the first place
      state.query = query; // set the current query to the new query
    },
    _DELETE(state, query) { // use delete() action
      state.queries.splice(state.queries.indexOf(query), 1);
    },
    SELECT(state, query) {
      state.query = query;
    },
  },
  getters: {
    QUERY(state) {
      return state.query;
    },
    QUERIES(state) {
      return state.queries;
    },
  },
  actions: {
    DELETE(context, query) {
      context.commit('_delete', query);
      if (context.state.queries.length) {
        context.commit('select', context.state.queries[0]);
      } else {
        context.commit('new');
      }
    },
  },
};
