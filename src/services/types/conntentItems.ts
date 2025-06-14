import { ContentItem } from '@/models/generated/schemas/contentItem'
import { ClientService } from '@feathersjs/feathers'
import { Filter } from '../../models/index.d'
import { BaseFind } from '../../models/generated/schemas'

interface FindResponse<T> extends Omit<BaseFind, 'data'> {
  data: T[]
}

interface FindQuery {
  order_by?: 'uid' | 'issue' | 'page' | 'newspaper' | 'hasTextContents'
  filters?: Filter[]
  limit?: number
  offset?: number
}

export type ContentItemsService = Pick<
  ClientService<ContentItem, unknown, unknown, FindResponse<ContentItem>, { query: FindQuery }>,
  'find' | 'get'
>
