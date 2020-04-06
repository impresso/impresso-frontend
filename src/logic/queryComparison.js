
/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').SearchQuery} SearchQuery
 * @typedef {{ type: string, query?: SearchQuery, id?: string, filters?: Filter[] }} Comparable
 */

export const ComparableTypes = Object.freeze({
  Intersection: 'intersection',
  Collection: 'collection',
  Query: 'query'
})

/**
 * @param {Comparable} comparable
 * @returns {SearchQuery | undefined}
 */
export function comparableToQuery(comparable) {
  if (comparable?.type === ComparableTypes.Collection){
    if (comparable?.id == null || comparable?.id === '') return undefined
    return { filters: [{ type: 'collection', q: comparable.id }] }
  }

  if (comparable?.type === ComparableTypes.Query) return comparable?.query
  if (comparable?.type === ComparableTypes.Intersection) {
    if (comparable?.filters == null) return undefined
    return { filters: comparable.filters }
  }
}
