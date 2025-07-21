import { ClientService } from '@feathersjs/feathers'
import { EntityMention } from '../../models/generated/schemas'
import { FindResponse, Filter } from '../../models/index.d'

export interface FindQuery {
  offset?: number
  limit?: number
  faster?: boolean
  order_by?: 'name' | '-name' | 'id' | '-id'
  filters?: Filter[]
}

export type MentionsService = Pick<
  ClientService<EntityMention, unknown, unknown, FindResponse<EntityMention>, { query: FindQuery }>,
  'find' | 'get'
>
