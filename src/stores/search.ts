import { defineStore } from 'pinia'

interface State {
}

export const useSearchStore = defineStore('search', {
  state: (): State => ({
  }),
  getters: {},
  actions: {
  },
  persist: {
    paths: [
      'searches',
      'currentSearchHash',
      'displaySortBy',
      'displaySortOrder',
      'displayStyle',
      'filterFacetYearExpanded'
    ],
  },
})
