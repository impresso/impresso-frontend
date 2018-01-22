import Vue from 'vue';
import VueResource from 'vue-resource';

Vue.use(VueResource);

const url = `${process.env.MIDDLELAYER_API}/suggestions`;

function SearchResult({
  title = 'test title',
  filter = {},
  data = {}, // raw return data
  df = 0,
  labels = [],
  label, // single type of the result
} = {}) {
  this.title = title;
  this.data = data;
  this.filter = filter;
  this.df = df;
  this.labels = labels;
  this.label = label;
}

function NamedEntityFilter({
  context = 'include',
  uid = '',
  label = 'The filter lavel',
} = {}) {
  this.type = 'NamedEntity';
  this.context = context;
  this.uid = uid;
  this.label = label;
}

export default {
  namespaced: true,
  state: {
    results: [],
  },
  mutations: {
    CLEAR_RESULTS(state) {
      state.results = [];
    },
    UPDATE_RESULTS(state, results) {
      state.results = results;
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

      const results = [];

      return new Promise(
        (resolve, reject) => {
          Vue.http.get(url,
            {
              params: {
                q: payload.query,
              },
            },
          ).then(
           (res) => {
             this.commit('SET_PROCESSING', false);
             if (res.body.result !== undefined) {
               for (let i = 0; i < res.body.result.length; i += 1) {
                 results.push(new SearchResult({
                   title: res.body.result[i].entity.name,
                   data: res.body.result[i],
                   filter: new NamedEntityFilter({
                     uid: res.body.result[i].entity.uid,
                     label: res.body.result[i].entity.name,
                   }),
                   df: res.body.result[i].entity.df,
                   labels: res.body.result[i].entity.labels,
                   label: res.body.result[i].entity.labels[1],
                 }));
               }

               context.commit('UPDATE_RESULTS', results);
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
