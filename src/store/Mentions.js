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
    LOAD_ENTITY_MENTIONS(context, { filters, limit = 10, page = 1 }) {
      // console.log('eid', entityUid);
      return services.mentions.find({
        query: {
          limit,
          page,
          filters,
        },
      }).then((res) => {
        context.state.pagination.totalRows = res.total;
        return res.data;
      });
    },
  },
};
