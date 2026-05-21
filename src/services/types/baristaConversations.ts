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
  total: number
  limit: number
  skip: number
}

export type BaristaConversationsService = Pick<
  ClientService<
    BaristaConversationWithHistory,
    undefined,
    BaristaConversationsPatchData,
    BaristaConversationsFindQuery
  >,
  'find' | 'get' | 'patch' | 'remove'
>
