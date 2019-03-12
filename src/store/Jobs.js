/* eslint-disable no-unused-vars */
import * as services from '@/services';


export default {
  namespaced: true,
  state: {
    data: [],
    jobs: [],
  },
  // getters: {
  //   jobs(state) {
  //     return state.jobs;
  //   },
  // },
  // mutations: {
  //   ADD_JOB(state, job) {
  //     state.jobs.push(job);
  //   },
  // },
  actions: {
    TEST() {
      return new Promise((resolve, reject) => {
        services.jobs.create({}).then((result) => {
          console.log('TEST', result);
          resolve(result);
          // context.commit('UPDATE_JOBS', result.data);
        }).catch((err) => {
          reject(err);
        });
      });
    },
    LOAD_JOBS(context, uid) {
      return new Promise((resolve, reject) => {
        services.jobs.find({}).then((result) => {
          resolve(result);
          // console.log('res', result);
          // context.commit('UPDATE_JOBS', result.data);
        }).catch((err) => {
          reject(err);
        });
      });
    },
  },
};
