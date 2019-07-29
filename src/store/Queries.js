import SearchQuery from '@/models/SearchQuery';

const InitalQuery = new SearchQuery({ title: 'Query 1' });

export default {
  namespaced: true,
  state: {
    queries: [InitalQuery],
    query: InitalQuery,
  },
  mutations: {
    new(state) {
      const query = new SearchQuery({ title: `Query ${state.queries.length + 1}` });
      state.queries.unshift(query);
      state.query = query;
    },
    _delete(state, query) {
      state.queries.splice(state.queries.indexOf(query), 1);
    },
    select(state, query) {
      state.query = query;
    },
  },
  actions: {
    delete(context, query) {
      context.commit('_delete', query);
      if (context.state.queries.length) {
        context.commit('select', context.state.queries[0]);
      } else {
        context.commit('new');
      }
    },
  },
};
