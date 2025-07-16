import { defineStore } from 'pinia'

export interface State {
  language: string
  limit: number
}

export const useEmbeddingsStore = defineStore('embeddings', {
  state: (): State => ({
    language: 'fr',
    limit: 25
  }),
  getters: {},
  actions: {
    updateLanguage(language: string) {
      this.language = language
    },
    updateLimit(limit: number) {
      this.limit = limit
    }
  },
  persist: {
    paths: []
  }
})
