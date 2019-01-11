import * as services from '@/services';
import Newspaper from '@/models/Newspaper';

export default {
  namespaced: true,
  state: {
    list: {
      orderBy: 'alphabetical',
      titles: [],
      query: '',
      pagination: {
        perPage: 100,
        currentPage: 1,
        totalRows: 0,
      },
    },
    detail: {
      orderBy: 'alphabetical',
      issues: [],
      title: false,
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
    UPDATE_LIST_TITLES(state, titles) {
      state.list.titles = titles;
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
    UPDATE_DETAIL_TITLE(state, title) {
      state.detail.title = title;
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
        page: context.state.list.pagination.currentPage,
      };

      return new Promise((resolve, reject) => {
        services.titles.find({
          query,
        }).then(
          (res) => {
            context.commit('UPDATE_LIST_PAGINATION_TOTAL_ROWS', res.total);
            context.commit('UPDATE_LIST_TITLES', res.data.map(title => new Newspaper({
              ...title,
              properties: title.properties.map((property) => {
                const keys = Object.keys(property);
                property.name = keys[0];
                return property[keys[0]];
              }),
            })));
            resolve(res);
          },
          reject,
        );
      });
    },
    LOAD_TITLE_ISSUES(context) {
      const query = {
        filters: [{
          type: 'newspaper',
          q: context.state.detail.title.uid,
          context: 'include',
        }],
        limit: context.state.detail.pagination.perPage,
        page: context.state.detail.pagination.currentPage,
      };
      return new Promise((resolve, reject) => {
        services.issues.find({
          query,
        }).then(
          (res) => {
            context.commit('UPDATE_DETAIL_PAGINATION_TOTAL_ROWS', res.total);
            context.commit('UPDATE_DETAIL_ISSUES', res.data);
            resolve(res);
          },
          reject,
        );
      });
    },
  },
};
