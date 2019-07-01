import * as services from '@/services';
// import Mention from '@/models/Mention';


export default {
  namespaced: true,
  state: {
    mentions: [],
    query: '',
    pagination: {
      perPage: 2,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    UPDATE_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.pagination.currentPage = parseInt(currentPage, 10);
    },
  },
  actions: {
    LOAD_DETAIL(context, entityId) {
      // console.log('eid', entityId);
      return new Promise((resolve, reject) => {
        services.mentions.find({
          limit: context.state.pagination.perPage,
          page: context.state.pagination.currentPage,
          query: {
            filters: [
              {
                q: entityId,
                type: 'entity',
              },
            ],
          },
        })
          .then((res) => {
            // console.log('MENTIONS', res);
            context.state.pagination.totalRows = res.total;
            resolve(res.data);
          })
          .catch(reject);
      });
    },
  },
};
