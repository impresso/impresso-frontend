/* eslint-disable no-unused-vars */
import * as services from '@/services';
import Job from '@/models/Job';

export default {
  namespaced: true,
  state: {
    data: [],
    items: [],
    itemsIndex: {},
    pagination: {
      perPage: 4,
      currentPage: 1,
      totalRows: -1,
    },
  },
  mutations: {
    SET_PAGINATION(state, { page, limit, total }) {
      state.pagination.totalRows = total;
      state.pagination.currentPage = page;
      state.pagination.totalRows = total;
    },
    CHANGE_ITEM_AT_INDEX(state, { idx, status, progress, task }) {
      console.info('CHANGE_ITEM_AT_INDEX', idx, status, progress);
      state.items[idx].status = status;
      if (typeof progress !== 'undefined') {
        state.items[idx].progress = progress;
      }
      if (typeof task !== 'undefined') {
        state.items[idx].task = task;
      }
    },
    SET_ITEMS(state, items) {
      state.items = items;
      console.info('-> SET_ITEMS', items);
    },
  },
  actions: {
    TEST() {
      return services.jobs.create({});
    },
    UPDATE_JOB({ commit, state, dispatch }, job) {
      const idx = state.items.findIndex(d => d.id === job.id);
      console.info('UPDATE JOB', job.id, job.status, idx);
      if (idx > -1) {
        commit('CHANGE_ITEM_AT_INDEX', {
          status: job.status,
          progress: job.progress,
          task: job.task,
          idx,
        });
      } else {
        // reload
        dispatch('LOAD_JOBS');
      }
    },
    LOAD_JOBS({ commit }, { page = 1, limit = 4 } = {}) {
      return services.jobs.find({
        query: {
          page,
          limit,
        },
      }).then((res) => {
        console.info('LOAD_JOBS', res);
        commit('SET_PAGINATION', { page, limit, total: res.total });
        commit('SET_ITEMS', res.data.map(d => ({
          ...d,
          progress: d.extra.progress,
        })));
      });
    },
    PATCH_JOB({ commit, state }, job) {
      return services.jobs.patch(job.id, job).then((res) => {
        const idx = state.items.findIndex(d => d.id === job.id);
        if (idx !== -1) {
          // update live:
          commit('CHANGE_ITEM_AT_INDEX', {
            idx,
            status: res.status,
          });
        }
        return res;
      });
    },
  },
};
