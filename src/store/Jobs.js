/* eslint-disable no-unused-vars */
import * as services from '@/services';


export default {
  namespaced: true,
  state: {
    data: [],
    jobs: [],
  },
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
    LOAD_JOBS(context) {
      return new Promise((resolve, reject) => {
        services.jobs.find({}).then((result) => {
          resolve(result);
          // context.commit('UPDATE_JOBS', result.data);
        }).catch((err) => {
          reject(err);
        });
      });
    },
    PATCH_JOB(context, job) {
      console.log('PATCH_JOB', job.id);
      return new Promise((resolve) => {
        services.jobs.patch(job.id, job)
          .then((res) => {
            console.log(res);
            return res;
          })
          .then(res => resolve(res));
      });
    },
  },
};
