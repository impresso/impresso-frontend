import SuggestionCollection from '@/models/SuggestionCollection'
import SuggestionFactory from '@/models/SuggestionFactory'
import { collections as collectionsService, suggestions as suggestionsService } from '@/services'
import { defineStore } from 'pinia'

export interface State {
  queries: string[]
  searchableQueries: string[]
}

export const useAutocompleteStore = defineStore('autocomplete', {
  state: (): State => ({
    queries: [],
    searchableQueries: [],
  }),
  getters: {},
  actions: {
    saveRecentQuery(query: string) {
      if (typeof query !== 'string') return
      const trimmedQuery = query.trim()
      if (trimmedQuery.length === 0) return
      if (this.queries.includes(trimmedQuery)) return

      this.queries.push(trimmedQuery)
    },
    suggestRecentQuery(query: string) {
      const nq = normalize(query)
      const candidates: { h: string; q: string; r: number }[] = []
      this.queries
        .filter(d => typeof d === 'string')
        .forEach(d => {
          const idx = normalize(d).indexOf(nq)
          if (idx > -1) {
            candidates.push({
              h: [
                d.substr(0, idx),
                '<b>',
                d.substr(idx, query.length),
                '</b>',
                d.substr(idx + query.length),
              ].join(''),
              q: d,
              r: query.length / d.length,
            })
          }
        })
      return candidates.sort((a, b) => b.r - a.r).slice(0, 3)
    },
    search(query: string) {
      return suggestionsService
        .find({
          query: {
            q: query,
            // we just want 9 results because we add the original string totalling 10 suggestions
            limit: 9,
          },
        })
        .then(({ data }) => data.map(d => SuggestionFactory.create(d)).filter(Boolean))
    },
    suggestCollections(query: string) {
      return collectionsService
        .find({
          query: {
            limit: 3,
            q: query,
          },
        })
        .then(co => {
          return co.data.map(d => {
            return new SuggestionCollection({
              item: d,
              h: d.name,
              q: d.uid,
              type: 'collection',
            })
          })
        })
    },
  },
  persist: {
    paths: ['queries'],
  },
})

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
