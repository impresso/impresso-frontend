import { ContentItem } from '@/models/generated/schemas/contentItem'
import { ClientService } from '@feathersjs/feathers'
import { Filter } from '../../models'
import { BaseFind } from '../../models/generated/schemas'

type OrderBy = 'date' | 'relevance' | 'uid' | 'issue' | 'page' | 'newspaper' | 'hasTextContents'
type ReverseOrderBy = `-${OrderBy}`
type FullOrderBy = OrderBy | ReverseOrderBy

export interface FindResponse<T> extends Omit<BaseFind, 'data'> {
  data: T[]
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

export type ContentItemsService = Pick<
  ClientService<
    ContentItem,
    unknown,
    unknown,
    FindResponse<ContentItem>,
    { query: FindQuery } | { query: GetQuery }
  >,
  'find' | 'get'
>
