/* eslint-disable no-unused-vars */
import { jobs as jobsService } from '@/services'
import Job from '@/models/Job'

export default {
  namespaced: true,
  state: {
    data: [],
    items: [],
    itemsIndex: {},
    totalItems: 0,
  },
  mutations: {
    CHANGE_ITEM_AT_INDEX(state, { idx, status, progress, task }) {
      state.items[idx].status = status
      if (typeof progress !== 'undefined') {
        state.items[idx].progress = progress
      }
      if (typeof task !== 'undefined') {
        state.items[idx].task = task
      }
    },
    SET_ITEMS(state, items) {
      state.items = items
    },
    SET_TOTAL_ITEMS(state, total) {
      state.totalItems = total
    },
  },
  actions: {
    TEST() {
      return jobsService.create({})
    },
    UPDATE_JOB({ commit, state, dispatch }, job) {
      const idx = state.items.findIndex(d => d.id === job.id)
      if (idx > -1) {
        commit('CHANGE_ITEM_AT_INDEX', {
          status: job.status,
          progress: job.progress,
          task: job.task,
          idx,
        })
      } else {
        // reload
        dispatch('LOAD_JOBS')
      }
    },
    LOAD_JOBS({ commit }, { page = 1, limit = 4 } = {}) {
      return jobsService
        .find({
          query: {
            page,
            limit,
          },
        })
        .then(({ data, total }) => {
          commit(
            'SET_ITEMS',
            data.map(
              d =>
                new Job({
                  ...d,
                  progress: d.extra ? d.extra.progress : 0,
                }),
            ),
          )
          commit('SET_TOTAL_ITEMS', total)
        })
    },
    PATCH_JOB({ commit, state }, job) {
      return jobsService.patch(job.id, job).then(res => {
        const idx = state.items.findIndex(d => d.id === job.id)
        if (idx !== -1) {
          // update live:
          commit('CHANGE_ITEM_AT_INDEX', {
            idx,
            status: res.status,
          })
        }
        return res
      })
    },
  },
}
