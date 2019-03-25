import * as services from '@/services';
import Newspaper from '@/models/Newspaper';

export default {
  namespaced: true,
  state: {
    list: {
      orderBy: 'name',
      newspapers: [],
      query: '',
      pagination: {
        perPage: 100,
        currentPage: 1,
        totalRows: 0,
      },
    },
    detail: {
      orderBy: 'name',
      issues: [],
      newspaper: false,
      pagination: {
        perPage: 12,
        currentPage: 1,
        totalRows: 0,
      },
    },
  },
  getters: {},
  mutations: {
    // list
    UPDATE_LIST_ORDER_BY(state, orderBy) {
      state.list.orderBy = orderBy;
    },
    UPDATE_LIST_NEWSPAPERS(state, newspapers) {
      state.list.newspapers = newspapers;
    },
    UPDATE_LIST_QUERY(state, query) {
      state.list.query = query;
    },
    UPDATE_LIST_PAGINATION_PER_PAGE(state, perPage) {
      state.list.pagination.perPage = parseInt(perPage, 10);
    },
    UPDATE_LIST_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.list.pagination.currentPage = parseInt(currentPage, 10);
    },
    UPDATE_LIST_PAGINATION_TOTAL_ROWS(state, totalRows) {
      state.list.pagination.totalRows = totalRows;
    },
    // detail
    UPDATE_DETAIL_ORDER_BY(state, orderBy) {
      state.detail.orderBy = orderBy;
    },
    UPDATE_DETAIL_ISSUES(state, issues) {
      state.detail.issues = issues;
    },
    UPDATE_DETAIL_NEWSPAPER(state, newspaper) {
      state.detail.newspaper = newspaper;
    },
    UPDATE_DETAIL_PAGINATION_PER_PAGE(state, perPage) {
      state.detail.pagination.perPage = parseInt(perPage, 10);
    },
    UPDATE_DETAIL_PAGINATION_CURRENT_PAGE(state, currentPage) {
      state.detail.pagination.currentPage = parseInt(currentPage, 10);
    },
    UPDATE_DETAIL_PAGINATION_TOTAL_ROWS(state, totalRows) {
      state.detail.pagination.totalRows = totalRows;
    },
  },
  actions: {
    LOAD_LIST(context) {
      const query = {
        q: context.state.list.query,
        limit: context.state.list.pagination.perPage,
        group_by: context.state.list.groupBy,
        order_by: context.state.list.orderBy,
        page: context.state.list.pagination.currentPage,
      };
      console.log('LOAD_LIST', query);
      return new Promise((resolve, reject) => {
        services.newspapers.find({
          query,
        }).then(
          (res) => {
            context.commit('UPDATE_LIST_PAGINATION_TOTAL_ROWS', res.total);
            context.commit('UPDATE_LIST_NEWSPAPERS', res.data.map(newspaper => new Newspaper({
              ...newspaper,
            })));
            resolve(res);
          },
          reject,
        );
      });
    },
    LOAD_PAGES_TIMELINE() {
      return new Promise((resolve, reject) => {
        services.pagesTimelines.get('stats', {})
          .then(res => resolve(res))
          .catch(reject);
      });
    },
    LOAD_DETAIL(context, newspaperUid) {
      return new Promise((resolve, reject) => {
        services.newspapers.get(newspaperUid, {})
          .then(res => resolve(res))
          .catch(reject);
      });
    },
    LOAD_ISSUES(context, {
      page = 1,
      orderBy = '-date',
      limit,
      filters = [],
    } = {}) {
      return new Promise((resolve, reject) => {
        services.issues.find({
          query: { filters, page, limit, order_by: orderBy },
        })
        .then((res) => {
          context.commit('UPDATE_DETAIL_PAGINATION_TOTAL_ROWS', res.total);
          resolve(res);
        })
        .catch(reject);
      });
    },
  },
};
