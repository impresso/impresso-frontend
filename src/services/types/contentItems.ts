import { ContentItem } from '@/models/generated/canonical/contentItem'
import { ClientService } from '@feathersjs/feathers'
import { Filter } from '../../models'
import { BaseFind } from '../../models/generated/deprecated/internalApi'

type OrderBy = 'date' | 'relevance' | 'id' | 'issue' | 'page' | 'newspaper' | 'hasTextContents'
type ReverseOrderBy = `-${OrderBy}`
type FullOrderBy = OrderBy | ReverseOrderBy

export interface FindResponse<T> extends Omit<BaseFind, 'data'> {
  data: T[]
}

export interface ContentItemsFindResult {
  data: ContentItem[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export interface FindQuery {
  order_by?: FullOrderBy
  filters?: Filter[]
  limit?: number
  offset?: number
}
export interface GetQuery {
  include_embeddings?: boolean
}

export interface ContentItemsQueryParams {
  // from FindQuery
  order_by?: FullOrderBy
  filters?: Filter[]
  // from GetQuery
  include_embeddings?: boolean
  // shared
  limit?: number
  offset?: number
}

export type ContentItemsService = Pick<
  ClientService<
    ContentItem,
    unknown,
    unknown,
    ContentItemsFindResult,
    { query?: ContentItemsQueryParams }
  >,
  'find' | 'get'
>
