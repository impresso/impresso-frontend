import * as services from '@/services';


export default {
  namespaced: true,
  state: {
    mentions: [],
  },
  getters: {},
  mutations: {},
  actions: {
    LOAD_MENTIONS() {
      return new Promise((resolve, reject) => {
        services.mentions.find({
          query: {
            name: 'Jean-Pierre',
          },
        })
          .then((results) => {
            console.log('mentions:', results);
            resolve(results);
          })
          .catch(reject);
      });
    },
  },
};
