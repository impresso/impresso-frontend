import Daterange from '@/models/Daterange';
import Entity from '@/models/Entity';
import Suggestion from '@/models/Suggestion';

import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    suggestions: [],
  },
  mutations: {
    CLEAR_SUGGESTIONS(state) {
      state.suggestions = [];
    },
    ADD_SUGGESTION(state, result) {
      state.suggestions.push(result);
    },
    ADD_SUGGESTIONS(state, results) {
      results.forEach((suggestion) => {
        state.suggestions.push(suggestion);
      });
    },
  },
  actions: {
    SEARCH(context, payload) {
      return new Promise(
        (resolve, reject) => {
          services.suggestions.find({
            query: {
              q: payload.query,
              // we just want 9 results because we
              // add the original string totalling 10 suggestions
              limit: 9,
            },
          }).then(
            (res) => {
              context.commit('CLEAR_SUGGESTIONS');
              context.commit('ADD_SUGGESTION', new Suggestion({
                entity: new Entity(),
                type: 'string',
                query: payload.query,
              }));

              context.commit('ADD_SUGGESTIONS', res.data.map(suggestion => new Suggestion({
                entity: new Entity(suggestion.entity),
                daterange: new Daterange({
                  daterange: suggestion.daterange,
                }),
                type: suggestion.type,
                query: payload.query,
              })));
              resolve(res);
            },
            (err) => {
              reject(err);
            },
          );
        },
      );
    },
  },
};
