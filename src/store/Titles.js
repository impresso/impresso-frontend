import * as services from '@/services';

export default {
  namespaced: true,
  state: {
    orderBy: 'alphabetical', // relevance, -relevance, date, -date
    titles: [],
    title: {},
    query: '',
    pagination: {
      perPage: 100,
      currentPage: 1,
      totalRows: 0,
    },
  },
  getters: {},
  mutations: {
    UPDATE_ORDER_BY(state, orderBy) {
      state.orderBy = orderBy;
    },
    UPDATE_PAGINATION_TOTAL_ROWS(state, totalRows) {
      state.pagination.totalRows = totalRows;
    },
    UPDATE_PAGINATION_CURRENT_PAGE(state, page) {
      state.pagination.currentPage = parseInt(page, 10);
    },
    UPDATE_TITLES(state, titles) {
      state.titles = titles;
    },
    UPDATE_TITLE(state, title) {
      state.title = title;
    },
    UPDATE_QUERY(state, query) {
      state.query = query;
    },
  },
  actions: {
    LOAD_TITLES(context) {
      return new Promise((resolve) => {
        services.titles.find({
          query: {
            page: context.state.pagination.currentPage,
            limit: context.state.pagination.perPage,
            orderBy: context.state.orderBy,
            q: context.state.query,
          },
        }).then((res) => {
          console.log(res);
          context.commit('UPDATE_PAGINATION_TOTAL_ROWS', res.total);
          context.commit('UPDATE_TITLES', res.data);
          resolve(res.data);
        });
      });
    },
    LOAD_TITLE(context, uid) {
      return new Promise(() => {
        services.titles.get(uid, {}).then((res) => {
          context.commit('UPDATE_TITLE', res.data);
        },
        (error) => {
          console.log(error);
        });
      });
    },
  },
};
