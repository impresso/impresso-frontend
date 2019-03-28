import SuggestionFactory from '@/models/SuggestionFactory';

import * as services from '@/services';

export default {
  namespaced: true,
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
              resolve(res.data.map(
                suggestion => SuggestionFactory.create(suggestion)).filter(Boolean));
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
