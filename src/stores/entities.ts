import { defineStore } from 'pinia'
import {
  contentItems as contentItemsService,
  mentions as mentionsService,
  entities as entitiesService,
  searchFacets as searchFacetsService
} from '@/services'
import Entity from '@/models/Entity'
import Facet from '@/models/Facet'
import Helpers from '@/plugins/Helpers'
import { FindQuery as FindContentItemsQuery } from '@/services/types/contentItems'
import { FindQuery as FindMentionsQuery } from '@/services/types/mentions'

export interface State {}

export const useEntitiesStore = defineStore('entities', {
  state: (): State => ({}),
  getters: {},
  actions: {
    loadEntityContentItems({ offset, filters, order_by }: FindContentItemsQuery = {}) {
      const query = {
        offset,
        filters,
        order_by
      } satisfies FindContentItemsQuery
      return contentItemsService.find({
        query
      })
    },
    loadEntityMentions({ offset, filters = [], order_by, faster }: FindMentionsQuery = {}) {
      const query = {
        faster,
        offset,
        filters,
        order_by
      }

      return mentionsService.find({
        query
      })
    },
    loadDetail(entityId: string) {
      return entitiesService.get(entityId, {}).then(res => {
        return new Entity(res)
      })
    },
    loadTimeline(entityId: string) {
      const query = {
        filters: [
          {
            type: 'entity',
            q: entityId
          }
        ]
        // group_by: 'articles',
      }
      return searchFacetsService
        .get('year', {
          query
        })
        .then(res => Helpers.timeline.fromBuckets(res.buckets))
    },
    loadPageTopics(pageId: string) {
      const query = {
        filters: [
          {
            type: 'page',
            q: pageId
          }
        ]
        // group_by: 'articles',
      }
      return searchFacetsService
        .get('topic', {
          query
        })
        .then(facet => Facet.fromSearchFacet(facet))
    },
    loadPageEntities(pageId: string) {
      const query = {
        facets: ['location', 'person'],
        filters: [
          {
            type: 'page',
            q: pageId
          }
        ]
        // group_by: 'articles',
      }
      return searchFacetsService
        .find({
          query
        })
        .then(response => {
          return [Facet.fromSearchFacet(response.data[0]), Facet.fromSearchFacet(response.data[1])]
        })
    }
  },
  persist: {
    paths: []
  }
})
