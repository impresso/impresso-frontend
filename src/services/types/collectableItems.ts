import { Id, NullableId } from '@feathersjs/feathers'
import { Filter } from 'impresso-jscommons'

export interface AddCollectableItemsFromFilters {
  /**
   * Filters to apply when selecting items to add to the collection
   */
  filters: Filter[]
  /**
   * Namespace to use when selecting items to add to the collection
   */
  namespace: 'search' | 'tr_passages'
}

/**
 * Request to update collectible items in a collection
 */
export interface UpdateCollectableItemsRequest {
  /**
   * IDs of the items to add to the collection
   */
  add?: string[]
  /**
   * IDs of the items to remove from the collection
   */
  remove?: string[]
}

/**
 * Request to update collectible items in a collection
 */
export interface CollectableItemsUpdatedResponse {
  /**
   * Total number of items added to the collection
   */
  totalAdded: number
  /**
   * Total number of items removed from the collection
   */
  totalRemoved: number
}

interface Params {
  route: {
    collection_id: Id
  }
}

export type ICollectableItemsService = {
  create(data: AddCollectableItemsFromFilters, params: Params): Promise<unknown>

  patch(
    id: NullableId,
    data: UpdateCollectableItemsRequest,
    params: Params
  ): Promise<CollectableItemsUpdatedResponse>
}
