import type { Filter } from '@/models'
import Entity from '@/models/Entity'
import Topic from '@/models/Topic'
import Helpers from '@/plugins/Helpers'
import { entities as entitiesService, searchFacets as searchFacetsService } from '@/services'
import { defineStore } from 'pinia'

export interface ActivateParameters {
  item: { uid: string }
  type: string
  filters?: Filter[]
  filtersUpdatedCallback?: (any) => void
  subtitle?: string
  disableFilterModification?: boolean
}

export interface State {
  applyCurrentSearchFilters: boolean
  filters: Filter[]
  timeline: object[]
  isPendingTimeline: boolean
  type?: string
  item?: { uid: string; wikidataId?: string }
  groupBy: 'articles'
  itemCountRelated: number
  isActive: boolean
  subtitle?: string
  disableFilterModification: boolean
  isPending?: boolean
}

export const useMonitorStore = defineStore('monitor', {
  state: (): State => ({
    applyCurrentSearchFilters: true,
    filters: [],
    timeline: [],
    isPendingTimeline: false,
    groupBy: 'articles',
    itemCountRelated: -1,
    isActive: false,
    subtitle: undefined,
    disableFilterModification: false,
    isPending: false
  }),
  getters: {},
  actions: {
    hide() {
      this.isActive = false
    },
    setApplyCurrentSearchFilters(value: boolean) {
      this.applyCurrentSearchFilters = value
    },
    updateFilters(filters: Filter[]) {
      this.filters = filters
    },
    loadItemTimeline() {
      // reset timeline
      this.timeline = []
      this.isPendingTimeline = true

      let filters: Filter[] = [
        {
          type: this.type,
          q: this.item?.uid
        }
      ]
      // if user asked to get details in current search:
      if (this.applyCurrentSearchFilters) {
        filters = filters.concat(this.filters)
      }
      // fetch article timeline related to the given type
      return searchFacetsService
        .get('year', {
          query: {
            // group_by: this.groupBy,
            filters,
            limit: 10000
          }
        })
        .then(res => {
          this.itemCountRelated = res.numBuckets
          this.timeline = Helpers.timeline.fromBuckets(res.buckets ?? [])
        })
        .finally(() => {
          this.isPendingTimeline = false
        })
    },
    activate({
      item,
      type,
      filters = [],
      filtersUpdatedCallback = () => {},
      subtitle = undefined,
      disableFilterModification = false
    }: ActivateParameters) {
      const unsubscribe = this.$onAction(({ name, args }) => {
        if (name === 'updateFilters') filtersUpdatedCallback(args[0])
        if (name === 'hide') unsubscribe()
      })

      this.subtitle = subtitle
      this.disableFilterModification = disableFilterModification
      this.filters = filters

      this.setItem({ item, type })
    },
    setItem({ item, type }: { item: { uid: string }; type: string }) {
      this.isActive = true
      this.item = item
      this.type = type

      this.isPending = true

      // add item resolution promise to the promise chain
      if (['persion', 'location'].includes(type)) {
        return Promise.all([
          this.loadItemTimeline(),
          entitiesService.get(item.uid).then(res => {
            if (['location', 'person'].indexOf(type) !== -1) {
              this.item = new Entity(res)
            } else if (type === 'topic') {
              this.item = new Topic(res)
            } else {
              this.item = res
            }
          })
        ])
          .catch(err => {
            console.error(err)
          })
          .finally(() => {
            this.isPending = false
          })
      }
      // if there is no item to fetch, just get the timeline data.
      this.item = item
      this.isPending = false

      return this.loadItemTimeline()
    }
  },
  persist: {
    paths: []
  }
})
