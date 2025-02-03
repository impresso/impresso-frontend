import Collection from '@/models/Collection'
import Helpers from '@/plugins/Helpers'
import {
  collectionsItems as collectionsItemsService,
  collections as collectionsService,
  searchFacets as searchFacetsService
} from '@/services'
import { defineStore } from 'pinia'

type SortOrder = '-date' | 'date' | '-size' | 'size'

export interface State {
  collectionsValue: (Collection | object)[]
  collectionsPaginationCurrentPage: number
  collectionsOrderBy: SortOrder
  collectionsQ: string
  collectionsPaginationPerPage: number
  collectionsPaginationTotalRows: number
}

export interface AddCollectionDetails {
  name: string
  description?: string
}

export interface EditCollectionDetails extends AddCollectionDetails {
  uid: string
}

export interface AddCollectionItemDetails {
  item: { uid: string }
  collection: { uid: string }
  contentType: string
}

export interface AddCollectionItemsDetails {
  items: { uid: string }[]
  collection: { uid: string }
  contentType: string
}

export interface RemoveCollectionItemDetails {
  item: { uid: string }
  collection: { uid: string }
}

export interface RemoveCollectionItemsDetails {
  items: { uid: string }[]
  collection: { uid: string }
}

const paginationPerPage = 20

export const useCollectionsStore = defineStore('collections', {
  state: (): State => ({
    collectionsValue: [],
    collectionsPaginationCurrentPage: 1,
    collectionsOrderBy: '-date',
    collectionsQ: '',
    collectionsPaginationPerPage: paginationPerPage,
    collectionsPaginationTotalRows: 0
  }),
  getters: {
    collections: state => {
      return state.collectionsValue.map(collection => {
        if (collection instanceof Collection) {
          return collection
        }
        return new Collection(collection)
      })
    }
  },
  actions: {
    loadCollections() {
      return new Promise(resolve => {
        collectionsService
          .find({
            query: {
              page: this.collectionsPaginationCurrentPage,
              limit: paginationPerPage,
              order_by: this.collectionsOrderBy,
              q: this.collectionsQ
            }
          })
          .then(results => {
            this.collectionsValue = results.data.map(
              result =>
                new Collection({
                  countArticles: result.count_articles,
                  countEntities: result.count_entities,
                  countIssues: result.count_issues,
                  countPages: result.count_pages,
                  creationDate: result.creation_date,
                  lastModifiedDate: result.last_modified_date,
                  ...result
                })
            )
            this.collectionsPaginationTotalRows = results.total
            resolve(results)
          })
      })
    },
    loadTimeline(collectionId: string) {
      const query = {
        filters: [
          {
            type: 'collection',
            q: collectionId
          }
        ],
        // group_by: 'articles',
        limit: 100000
      }
      return searchFacetsService
        .get('year', {
          query
        })
        .then(res => Helpers.timeline.fromBuckets(res.buckets))
    },
    editCollection({ uid, name, description }: EditCollectionDetails) {
      return collectionsService.patch(uid, {
        name,
        description
      })
    },
    addCollection({ name, description }: AddCollectionDetails) {
      return collectionsService.create({
        name,
        description
      })
    },
    deleteCollection(uid: string) {
      return collectionsService.remove(uid)
    },
    addCollectionItem({ item, collection, contentType }: AddCollectionItemDetails) {
      return collectionsItemsService.create({
        collection_uid: collection.uid,
        items: [
          {
            content_type: contentType,
            uid: item.uid
          }
        ]
      })
    },
    addCollectionItems({ items, collection, contentType }: AddCollectionItemsDetails) {
      return collectionsItemsService.create({
        collection_uid: collection.uid,
        items: items.map(item => ({
          uid: item.uid,
          content_type: contentType
        }))
      })
    },
    removeCollectionItem({ item, collection }: RemoveCollectionItemDetails) {
      const contentType = item.constructor.name.toLowerCase()

      return collectionsItemsService.remove(null, {
        query: {
          collection_uid: collection.uid,
          items: [
            {
              content_type: contentType,
              uid: item.uid
            }
          ]
        }
      })
    },
    removeCollectionItems({ items, collection }: RemoveCollectionItemsDetails) {
      return collectionsItemsService.remove(null, {
        query: {
          collection_uid: collection.uid,
          items: items.map(item => ({
            uid: item.uid
          }))
        }
      })
    },
    updatePaginationListCurrentPage(page: number | string) {
      this.collectionsPaginationCurrentPage = typeof page === 'string' ? parseInt(page, 10) : page
    },
    setCollectionsSortOrder(sortOrder: SortOrder) {
      this.collectionsOrderBy = sortOrder
    },
    setCollectionsQ(q: string) {
      this.collectionsQ = q
    }
  },
  persist: {
    paths: ['collectionsSortOrder']
  }
})
