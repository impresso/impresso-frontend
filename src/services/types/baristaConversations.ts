import type { ClientService } from '@feathersjs/feathers'
import { BaristaMessageItem } from './barista'

export interface BaristaConversation {
  baristaSessionId: string
  label: string
  dateCreated: string
  dateLastModified: string
  userId: number
}

export type BaristaConversationWithHistory = BaristaConversation & {
  messages: BaristaMessageItem[]
}

export interface BaristaConversationsFindQuery {
  limit?: number
  offset?: number
}

export interface BaristaConversationsPatchData {
  label: string
}

export interface BaristaConversationsFindResult {
  data: BaristaConversation[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

export type BaristaConversationsService = Pick<
  ClientService<
    BaristaConversationWithHistory,
    unknown,
    BaristaConversationsPatchData,
    BaristaConversationsFindResult,
    { query?: BaristaConversationsFindQuery }
  >,
  'find' | 'get' | 'patch' | 'remove' | 'create' | 'update'
>
