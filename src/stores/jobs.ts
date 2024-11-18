import { defineStore } from 'pinia'
import { jobs as jobsService } from '@/services'
import Job from '@/models/Job'

interface State {
  items: Job[]
  totalItems: number
}

export const useJobsStore = defineStore('jobs', {
  state: (): State => ({
    items: [],
    totalItems: 0
  }),
  getters: {},
  actions: {
    createTestJob() {
      return jobsService.create({})
    },
    updateJob(job: Job) {
      const idx = this.items.findIndex(d => d.id === job.id)
      if (idx > -1) {
        this.items[idx].status = job.status

        if (typeof job.progress !== 'undefined') {
          this.items[idx].progress = job.progress
        }

        if (typeof job.task !== 'undefined') {
          this.items[idx].task = job.task
        }
        return Promise.resolve()
      } else {
        // reload
        return this.loadJobs()
      }
    },
    loadJobs({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) {
      return jobsService
        .find({
          query: {
            page,
            limit
          }
        })
        .then(({ data, total }) => {
          console.info('loadJobs', data)
          this.items = data.map(
            d =>
              new Job({
                ...d,
                progress: d.extra ? d.extra.progress : 0
              })
          )
          this.totalItems = total
        })
    }
  },
  persist: {
    paths: []
  }
})
