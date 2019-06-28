import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    language: 'fr',
    embeddings: [],
  },
  mutations: {
    UPDATE_LANGUAGE(state, language) {
      state.language = language;
    },
    UPDATE_EMBEDDINGS(state, embeddings) {
      state.embeddings = embeddings;
    },
  },
  actions: {
    FIND(context, q) {
      context.commit('UPDATE_EMBEDDINGS', ['_fetching']);
      return new Promise(
        (resolve, reject) => {
          services.embeddings.find({
            query: {
              q,
              language: context.state.language,
            },
          }).then(
            (res) => {
              context.commit('UPDATE_EMBEDDINGS', res.data);
            },
            (err) => {
              context.commit('UPDATE_EMBEDDINGS', ['_error', err.message]);
              reject(err);
            },
          );
        },
      );
    },
  },
};
