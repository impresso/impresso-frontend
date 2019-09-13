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
      return services.jobs.create({});
    },
    LOAD_JOBS(context) {
      return services.jobs.find({});
    },
    PATCH_JOB(context, job) {
      return services.jobs.patch(job.id, job);
    },
  },
};
