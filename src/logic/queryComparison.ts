import { Filter, SearchQuery } from '@/models'

export interface Comparable {
  type: string
  query?: SearchQuery
  id?: string
  filters?: Filter[]
}

export const ComparableTypes = Object.freeze({
  Intersection: 'intersection',
  Collection: 'collection',
  Query: 'query'
})

export const comparableToQuery = (comparable: Comparable): SearchQuery | undefined => {
  if (comparable?.type === ComparableTypes.Collection) {
    if (comparable?.id == null || comparable?.id === '') return undefined
    return { filters: [{ type: 'collection', q: comparable.id }] }
  }

  if (comparable?.type === ComparableTypes.Query) return comparable?.query
  if (comparable?.type === ComparableTypes.Intersection) {
    if (comparable?.filters == null) return undefined
    return { filters: comparable.filters }
  }
}
