import SuggestionFactory from '@/models/SuggestionFactory';

import * as services from '@/services';

const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default {
  namespaced: true,
  state: {
    queries: [],
    // queries, translitted without any accent.
    searchableQueries: [],
  },
  mutations: {
    ADD_QUERY(state, q) {
      if (!state.queries.includes(q)) {
        state.queries.push(q);
      }
    },
  },
  actions: {
    SAVE_RECENT_QUERY({ commit }, { q }) {
      if (typeof q === 'string' && q.trim().length) {
        commit('ADD_QUERY', q);
      }
    },
    SUGGEST_RECENT_QUERY({ state }, q) {
      const nq = normalize(q);
      const candidates = [];
      state.queries.filter(d => typeof d === 'string').forEach((d) => {
        const idx = normalize(d).indexOf(nq);
        if (idx > -1) {
          candidates.push({
            h: [
              d.substr(0, idx),
              '<b>',
              d.substr(idx, q.length),
              '</b>',
              d.substr(idx + q.length),
            ].join(''),
            q: d,
            r: q.length / d.length,
          });
        }
      });
      return candidates.sort((a, b) => b.r - a.r).slice(0, 3);
    },
    SEARCH(context, { q }) {
      return services.suggestions.find({
        query: {
          q,
          // we just want 9 results because we add the original string totalling 10 suggestions
          limit: 9,
        },
      }).then(({ data }) => data.map(d => SuggestionFactory.create(d)).filter(Boolean));
    },
  },
};
