import { Filter } from '@/models'
import { ClientService } from '@feathersjs/feathers'
import { BaseFind, SearchFacet } from '../../models/generated/schemas'

interface FindResponse<T> extends Omit<BaseFind, 'data'> {
  data: T[]
}

interface GetQuery {
  offset?: number
  limit?: number
  order_by?: {
    count?: 'asc' | 'desc'
    index?: 'asc' | 'desc'
  }
  filters?: Filter[]
}

interface FindQuery extends GetQuery {
  facets?: string[]
}
export type SearchFacetsService = Pick<
  ClientService<SearchFacet, unknown, unknown, FindResponse<SearchFacet>, { query: FindQuery }>,
  'find' | 'get'
>
