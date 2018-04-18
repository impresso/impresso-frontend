import Vue from 'vue';
import VueResource from 'vue-resource';

import SearchResult from '../modules/AutocompleteSearchResult';
import NamedEntityFilter from '../modules/filters/NamedEntity';
import StringFilter from '../modules/filters/String';

import * as services from '../services';

Vue.use(VueResource);

export default {
  namespaced: true,
  state: {
    results: [],
  },
  mutations: {
    CLEAR_RESULTS(state) {
      state.results = [];
    },
    ADD_RESULT(state, result) {
      state.results.push(result);
    },
  },
  actions: {
    SEARCH(context, payload) {
      context.commit('CLEAR_RESULTS');

      if (payload.query.length < 1 || payload.query === undefined) {
        return false;
      }

      context.commit('CLEAR_RESULTS');
      this.commit('SET_PROCESSING', true);

      // we commit now because we want to see the first result immediatly
      context.commit('ADD_RESULT', new SearchResult({
        title: payload.query,
        filter: new StringFilter({
          title: payload.query,
          query: payload.query,
        }),
        label: 'string',
      }));

      return new Promise(
        (resolve, reject) => {
          services.suggestion.find({
            query: {
              q: payload.query,
            },
          }).then(
           (res) => {
             this.commit('SET_PROCESSING', false);
             if (res.result !== undefined) {
               res.result.forEach((result) => {
                 let filter = {};

                 if (result.type === 'entity') {
                   filter = new NamedEntityFilter({
                     title: result.entity.name,
                     uid: result.entity.uid,
                     label: result.entity.labels[1],
                   });
                 }

                 context.commit('ADD_RESULT', new SearchResult({
                   title: result.entity.name,
                   data: result,
                   filter,
                   label: result.entity.labels[1],
                 }));
               });
             }

             resolve(res);
           },
           (err) => {
             this.commit('SET_PROCESSING', false);
             reject(err);
           },
         );
        },
      );
    },
  },
};
