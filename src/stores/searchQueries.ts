import { defineStore } from 'pinia'

export const SearchQueryHistoryLimit = 10

export interface SearchQueryHashEntry {
  hash: string
  timestamp: number
  summary?: string
}

export interface SearchQueriesState {
  entries: SearchQueryHashEntry[]
}

export const useSearchQueriesStore = defineStore('searchQueries', {
  state: (): SearchQueriesState => ({
    entries: []
  }),
  getters: {
    all(state): SearchQueryHashEntry[] {
      return state.entries
    },
    byHash: state => {
      return (hash: string): SearchQueryHashEntry | undefined => {
        return state.entries.find(entry => entry.hash === hash)
      }
    }
  },
  actions: {
    recordHash(hash: string, summary?: string) {
      const normalizedHash = hash.trim()
      if (!normalizedHash) {
        return
      }

      const now = Date.now()
      const existingIndex = this.entries.findIndex(entry => entry.hash === normalizedHash)

      if (existingIndex !== -1) {
        const existingEntry = this.entries[existingIndex]
        const updatedEntry: SearchQueryHashEntry = {
          ...existingEntry,
          timestamp: now,
          summary: summary ?? existingEntry.summary
        }
        this.entries.splice(existingIndex, 1)
        this.entries.unshift(updatedEntry)
        return
      }

      this.entries.unshift({
        hash: normalizedHash,
        timestamp: now,
        summary
      })

      if (this.entries.length > SearchQueryHistoryLimit) {
        this.entries = this.entries.slice(0, SearchQueryHistoryLimit)
      }
    },
    removeHash(hash: string) {
      const normalizedHash = hash.trim()
      if (!normalizedHash) {
        return
      }
      this.entries = this.entries.filter(entry => entry.hash !== normalizedHash)
    },
    clear() {
      this.entries = []
    }
  },
  persist: {
    paths: ['entries']
  }
})
