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
          .then((res: any) => {
            this.collectionsValue = res.data.map(
              (item: {
                accessLevel: 'private' | 'public'
                createdAt: Date
                description: string
                title: string
                totalItems: number
                uid: string
                updatedAt: Date
              }) =>
                new Collection({
                  uid: item.uid,
                  name: item.title,
                  countItems: item.totalItems,
                  status: item.accessLevel,
                  description: item.description,
                  lastModifiedDate: new Date(item.updatedAt),
                  creationDate: new Date(item.createdAt)
                })
            )
            this.collectionsPaginationTotalRows = res.pagination.total
            resolve(this.collectionsValue)
          })
      })
    },
    loadTimeline(collectionId: string) {
      if (!collectionId) return Promise.resolve([])
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
        title: name,
        description
      })
    },
    addCollection({ name, description }: AddCollectionDetails) {
      return collectionsService.create({
        title: name,
        description
      })
    },
    deleteCollection(uid: string) {
      return collectionsService.remove(uid)
    },
    addCollectionItem({ item, collection }: AddCollectionItemDetails) {
      return collectionsItemsService.patch(
        null,
        { add: [item.uid] },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
    },
    addCollectionItems({ items, collection }: AddCollectionItemsDetails) {
      return collectionsItemsService.patch(
        null,
        { add: items.map(i => i.uid) },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
    },
    removeCollectionItem({ item, collection }: RemoveCollectionItemDetails) {
      return collectionsItemsService.patch(
        null,
        { remove: [item.uid] },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
    },
    removeCollectionItems({ items, collection }: RemoveCollectionItemsDetails) {
      return collectionsItemsService.patch(
        null,
        { remove: items.map(i => i.uid) },
        {
          route: {
            collection_id: collection.uid
          }
        }
      )
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
