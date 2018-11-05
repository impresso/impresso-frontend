import Daterange from '@/models/Daterange';
import Entity from '@/models/Entity';
import Suggestion from '@/models/Suggestion';

import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    suggestions: [], // list of search results
    suggestion: new Suggestion(), // the first sugestion ie. type string or regex
  },
  getters: {
    suggestions(state) {
      return new Array(state.suggestion).concat(state.suggestions);
    },
  },
  mutations: {
    CLEAR_SUGGESTIONS(state) {
      state.suggestions = [];
      state.suggestion = new Suggestion();
    },
    SET_SUGGESTION(state, suggestion) {
      state.suggestion = suggestion;
    },
    SET_SUGGESTIONS(state, suggestions) {
      state.suggestions = suggestions;
    },
  },
  actions: {
    SEARCH(context, payload) {
      context.commit('SET_SUGGESTION', new Suggestion({
        type: 'string',
        query: payload.query,
      }));

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
              context.commit('SET_SUGGESTIONS', res.data.map(suggestion => new Suggestion({
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
