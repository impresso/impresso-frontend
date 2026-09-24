import { defineStore } from 'pinia'
import { jobs as jobsService } from '@/services'
import Job from '@/models/Job'

export interface State {
  items: Job[]
  totalItems: number
  isLoading: boolean
  stoppingIds: number[]
}

/**
 * Merge two `extra` payloads. New values win, but keys absent from the
 * update are preserved: the websocket often sends progress-only payloads
 * that would otherwise blow away `collection`, `query`, `sq`, `total`.
 */
function mergeExtra(current: Record<string, any>, incoming: Record<string, any> = {}) {
  const result: Record<string, any> = { ...(current || {}) }
  for (const [key, value] of Object.entries(incoming)) {
    if (value === undefined) continue
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof result[key] === 'object' &&
      result[key] !== null &&
      !Array.isArray(result[key])
    ) {
      result[key] = { ...result[key], ...value }
    } else {
      result[key] = value
    }
  }
  return result
}

/** Always store job ids as numbers (list API may send strings). */
function normalizeId(id: unknown): number | null {
  const n = typeof id === 'number' ? id : typeof id === 'string' ? Number(id) : NaN
  return Number.isFinite(n) ? n : null
}

/** Build a Job instance from a raw backend payload (keeps the `sq` alias). */
function buildJob(raw: any): Job {
  const extra = raw?.extra ?? {}
  const id = normalizeId(raw?.id)
  return new Job({
    ...raw,
    id: id ?? -1,
    extra: {
      ...extra,
      sq: extra.sq ?? extra.query_hash ?? ''
    },
    progress: extra.progress ?? raw?.progress ?? 0
  })
}

/** Strip `undefined` values so partial payloads don't erase known fields. */
function definedFields(payload: Record<string, any>) {
  return Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined))
}

export const useJobsStore = defineStore('jobs', {
  state: (): State => ({
    items: [],
    totalItems: 0,
    isLoading: false,
    stoppingIds: []
  }),
  getters: {
    isStopping: state => (id: number) => state.stoppingIds.includes(id)
  },
  actions: {
    /**
     * Apply a websocket/patch update to a job that is already in the list.
     * Never inserts a new card here - new jobs only enter via loadJobs, so
     * a socket event can't spawn a second "ghost" copy of the same export.
     */
    updateJob(payload: Partial<Job> & { id: number | string; extra?: Record<string, any> }) {
      const id = normalizeId(payload?.id)
      if (id == null) return

      const idx = this.items.findIndex(d => d.id === id)
      if (idx === -1) {
        // Unknown job: refresh from the server instead of inventing a card.
        void this.loadJobs()
        return
      }

      const current = this.items[idx]
      const updated = buildJob({
        ...current,
        ...definedFields(payload as Record<string, any>),
        id,
        creationDate: current.creationDate,
        lastModifiedDate: new Date(),
        extra: mergeExtra(current.extra, payload.extra ?? {})
      })
      this.items.splice(idx, 1, updated)
      if (updated.isTerminal()) {
        this.stoppingIds = this.stoppingIds.filter(sid => sid !== id)
      }
    },

    /**
     * Replace the list from the server. For jobs we already know about,
     * keep whichever progress/timestamp is further along so the poll
     * (which often reports 0% for running jobs) doesn't wipe live socket
     * progress.
     */
    loadJobs({ page = 1, limit = 4 }: { page?: number; limit?: number } = {}) {
      this.isLoading = true
      return jobsService
        .find({ query: { page, limit } })
        .then(({ data, total }) => {
          const prevById = new Map(
            this.items
              .map(job => [normalizeId(job.id), job] as const)
              .filter((entry): entry is readonly [number, Job] => entry[0] != null)
          )
          this.items = data.map(d => {
            const server = buildJob(d)
            const id = normalizeId(server.id)
            if (id != null) server.id = id
            const prev = id != null ? prevById.get(id) : undefined
            if (prev) {
              if (!server.isTerminal() && (prev.progress || 0) > (server.progress || 0)) {
                server.progress = prev.progress
                server.extra.progress = prev.progress
                if (!server.extra.message && prev.extra.message) {
                  server.extra.message = prev.extra.message
                }
              }
              if (prev.lastModifiedDate.getTime() > server.lastModifiedDate.getTime()) {
                server.lastModifiedDate = prev.lastModifiedDate
              }
            }
            return server
          })
          this.totalItems = total
          this.stoppingIds = this.stoppingIds.filter(sid =>
            this.items.some(item => item.id === sid && item.isRunning())
          )
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /**
     * Ask the server to stop a running job, optimistically flagging it as
     * "stopping" so the UI reacts immediately. Clears the flag on failure.
     */
    async stopJob(id: number) {
      const job = this.items.find(d => d.id === id)
      if (!job) return
      if (!this.stoppingIds.includes(id)) {
        this.stoppingIds = [...this.stoppingIds, id]
      }
      try {
        const result = await jobsService.patch(id, { status: 'stop' })
        if (result && typeof result === 'object') {
          this.updateJob(result as Partial<Job> & { id: number })
        }
      } catch (error) {
        this.stoppingIds = this.stoppingIds.filter(sid => sid !== id)
        throw error
      }
    }
  },
  persist: {
    paths: []
  }
})
