import { ClientService } from '@feathersjs/feathers'
import { FindResponse } from '../../models/index.d'

/**
 * Represents a word match result from word embeddings similarity search
 */
export interface WordMatch {
  /**
   * Unique identifier for the word
   */
  id: string
  /**
   * The language code of the word
   */
  languageCode: string
  /**
   * The word
   */
  word: string
}

type FindQuery = Pick<FindResponse<unknown>['pagination'], 'limit' | 'offset'> & {
  term: string
  /** filter baseline vectors search by language. */
  language_code?: string
  top_k?: number
}

export type EmbeddingsService = Pick<
  ClientService<WordMatch, unknown, unknown, FindResponse<WordMatch>, { query: FindQuery }>,
  'find'
>
