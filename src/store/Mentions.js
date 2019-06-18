import * as services from '@/services';
// import Mention from '@/models/Mention';


export default {
  namespaced: true,
  state: {
    mentions: [],
    query: '',
  },
  getters: {},
  mutations: {},
  actions: {
    LOAD_DETAIL(context, entityId) {
      console.log('LOAD_DETAIL', entityId);
      return new Promise((resolve, reject) => {
        services.mentions.find(entityId, {})
          .then(res => resolve(res))
          .catch(reject);
      });
    },
  },
};
