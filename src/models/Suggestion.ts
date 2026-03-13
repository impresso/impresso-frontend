import Daterange from '@/models/Daterange'
import Collection from '@/models/Collection'
import Topic from '@/models/Topic'
import FilterString from '@/models/FilterString'

export type SuggestionType =
  | 'person'
  | 'location'
  | 'organization'
  | 'nag'
  | 'topic'
  | 'collection'
  | 'mention'
  | 'newspaper'
  | 'entity'

interface ITyped<T> {
  type: T
}

export interface ISuggestion<T> extends ITyped<SuggestionType> {
  q: string | string[]
  h: string
  type: SuggestionType
  item?: T
  context?: string
  weight?: number
}

export class Suggestion<T> implements ISuggestion<T> {
  q: string | string[]
  h: string
  type: SuggestionType
  item?: T
  context: string
  weight?: number

  constructor({
    type,
    q = '',
    h = '',
    item = undefined,
    context = 'include',
    weight = -1,
  }: ISuggestion<T> & { context?: string }) {
    this.q = q
    this.h = String(h)
    this.type = type
    this.context = context
    if (item !== undefined) {
      this.item = item
    }
    if (weight !== -1) {
      this.weight = weight
    }
  }
}

export interface IDateRangeSuggestion extends ITyped<'daterange'> {
  type: 'daterange'
  context: 'include'
  daterange: Daterange
  text?: string
}

export class SuggestionDaterange implements IDateRangeSuggestion {
  type: 'daterange' = 'daterange'
  context: 'include' = 'include'
  daterange: Daterange

  constructor(args: ConstructorParameters<typeof Daterange>[0]) {
    this.daterange = new Daterange(args)
  }
}

export interface IRegexSuggestion extends ITyped<'regex'> {
  type: 'regex'
  q: string
  context: 'include'
}

export class SuggestionRegex implements IRegexSuggestion {
  type: 'regex' = 'regex'
  context: 'include' = 'include'
  q: string

  constructor({ q }: { q: string }) {
    this.q = q
  }
}

export const isDateRangeSuggestion = (suggestion?: ITyped<any>): suggestion is IDateRangeSuggestion =>
  suggestion?.type === 'daterange'

export const isRegexSuggestion = (suggestion?: ITyped<any>): suggestion is IRegexSuggestion =>
  suggestion?.type === 'regex'

export const isDefaultSuggestion = (suggestion?: ITyped<any>): suggestion is ISuggestion<any> =>
  suggestion !== undefined &&
  !isDateRangeSuggestion(suggestion) &&
  !isRegexSuggestion(suggestion) &&
  'q' in suggestion &&
  'h' in suggestion &&
  'type' in suggestion

export const isSuggestion = (
  suggestion?: ITyped<any>
): suggestion is ISuggestion<any> | IDateRangeSuggestion | IRegexSuggestion =>
  isDateRangeSuggestion(suggestion) || isRegexSuggestion(suggestion) || isDefaultSuggestion(suggestion)

type AnySuggestion = Suggestion<any> | SuggestionDaterange | SuggestionRegex | FilterString

export const createSuggestion = (data: any): AnySuggestion | null => {
  switch (data.type) {
    case 'person':
    case 'location':
    case 'entity':
    case 'newspaper':
      return new Suggestion({ ...data, q: data.item?.id != null ? [data.item.id] : data.q })
    case 'mention':
      return new Suggestion({
        ...data,
        type: 'mention' as SuggestionType,
        item: {
          frequence: parseInt(data.item?.frequence, 10),
          name: String(data.item?.name),
          type: String(data.item?.type),
        },
      })
    case 'string':
    case 'title':
      return new FilterString(data)
    case 'daterange':
      return new SuggestionDaterange(data)
    case 'regex':
      return new SuggestionRegex(data)
    case 'topic':
      return new Suggestion({ ...data, item: data.item ? new Topic(data.item) : undefined })
    case 'collection':
      return new Suggestion({ ...data, item: data.item ? new Collection(data.item) : undefined })
    default:
      console.error(`no case for ${data.type}`, data)
      return null
  }
}
