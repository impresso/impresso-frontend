import { protobuf } from 'impresso-jscommons'

/**
 * @typedef {import('../models').Filter} Filter
 * @typedef {import('../models').Entity} Entity
 */

export function toCanonicalFilter(filter) {
  const { context, op, type, precision, q, daterange, uids } = filter || {}
  return { context, op, type, precision, q, daterange, uids }
}

export function toSerializedFilter(filter) {
  return protobuf.filter.serialize(toCanonicalFilter(filter))
}

export function toSerializedFilters(filters) {
  return protobuf.searchQuery.serialize({ filters: filters?.map(toCanonicalFilter) ?? [] })
}

export const NumericRangeFacets = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'contentLength'
]

export const TimeRangeFacets = ['daterange']

export const RangeFacets = NumericRangeFacets.concat(TimeRangeFacets)

/**
 * @param {Filter} p
 * @returns {string}
 */
const getFilterMergeKey = ({ type, op = 'OR', context = 'inclusive', precision = 'exact' }) => {
  return `t:${type}-o:${op}-c:${context}-p:${precision}`
}

/**
 * @param {object} object
 * @param {function} fn
 * @returns {object}
 */
const omitBy = (object, fn) =>
  Object.keys(object).reduce((acc, key) => {
    const value = object[key]
    if (!fn(value)) acc[key] = value
    return acc
  }, {})

/**
 * Optimize filters by merging filters of the same type with the same
 * context/precision where possible.
 * @param {Filter[]} filters
 * @returns {Filter[]}
 */
export function optimizeFilters(filters) {
  if (!Array.isArray(filters)) {
    console.error('optimizeFilters: filters is not an array', filters)
    return []
  }
  if (filters.length === 0) return []
  const groupingMap = filters.reduce((map, filter, i) => {
    let key = getFilterMergeKey(filter)
    // DO NOT GROUP range filters together
    if (RangeFacets.includes(filter.type)) {
      key += `-${i}`
    }
    if (filter.type === 'string') {
      key += `-${i}`
    }

    const items = map.get(key) || []
    map.set(key, items.concat([filter]))
    return map
  }, new Map())

  return [...groupingMap.entries()].map(([, filters]) => {
    const { type, context, precision, op } = filters[0]

    const q = filters
      .flatMap(({ q }) => {
        return Array.isArray(q) ? q : [q]
      })
      .filter(value => value != null)

    return omitBy(
      {
        type,
        context,
        precision,
        op,
        q: q.length > 1 ? q : q[0]
      },
      value => value == null
    )
  })
}

export const serializeFilters = toSerializedFilters

/**
 * @param {string | undefined} serializedFilters
 * @param {Filter[]} defaultFilters
 * @returns {Filter[]}
 */
export function deserializeFilters(serializedFilters, defaultFilters = []) {
  if (typeof serializedFilters === 'string')
    return protobuf.searchQuery.deserialize(serializedFilters).filters ?? defaultFilters
  return defaultFilters
}

/**
 * @param {{filtersWithItems: { filter: Filter, items: Entity[] }[] }} object
 * @returns {Filter[]}
 */
export function joinFiltersWithItems({ filtersWithItems }) {
  return filtersWithItems.map(({ filter, items }) => ({ ...filter, items }))
}

/**
 * @param {Filter} expectedFilter
 * @returns {(filter: Filter) => boolean}
 */
export const containsFilter = expectedFilter => filter => {
  const expectedMergeKey = getFilterMergeKey(expectedFilter)
  const mergeKey = getFilterMergeKey(filter)

  const [noramlisedQA, noramlisedQB] = [expectedFilter, filter].map(({ q }) => {
    if (Array.isArray(q)) {
      if (q.length === 1) return q[0]
      return JSON.stringify(q)
    }
    return q
  })
  return expectedMergeKey === mergeKey && noramlisedQA === noramlisedQB
}

/**
 * Impresso has several indexes each supporting a different set of filters.
 * This lookup table below should be used to pick only those filters that are
 * supported by the particular search service. Using filters that are not supported
 * by a service will cause the API to return an error.
 *
 * NOTE: please keep up-to-date with the API when filters are added or changed.
 */
export const SupportedFiltersByContext = Object.freeze({
  search: [
    'hasTextContents',
    'ocrQuality',
    'contentLength',
    'isFront',
    'string',
    'title',
    'daterange',
    'uid',
    'accessRight',
    'partner',
    'language',
    'page',
    'collection',
    'issue',
    'newspaper',
    'topic',
    'year',
    'type',
    'country',
    'mention',
    'entity',
    'person',
    'location',
    'topicmodel',
    'topic-string',
    'entity-string',
    'entity-type',
    'regex',
    'textReuseCluster'
  ],
  textReuse: [
    'textReuseClusterSize',
    'textReuseClusterLexicalOverlap',
    'textReuseClusterDayDelta',
    'textReuseCluster',
    'daterange',
    'newspaper',
    'collection',
    'isFront',
    'string',
    'language',
    'topic',
    'type',
    'country',
    'location',
    'person',
    'entity'
  ],
  textReusePassages: [
    'textReuseCluster',
    'textReuseClusterSize',
    'textReuseClusterLexicalOverlap',
    'textReuseClusterDayDelta',
    'daterange',
    'newspaper',
    'collection',
    'language',
    'string',
    'isFront',
    'title',
    'topic',
    'type',
    'country',
    'location',
    'person',
    'entity'
  ],
  textReuseClusters: [
    'textReuseCluster',
    'textReuseClusterSize',
    'textReuseClusterLexicalOverlap',
    'textReuseClusterDayDelta',
    'newspaper'
  ],
  entities: ['string', 'type', 'uid']
})

export const SupportedFiltersByIndex = Object.freeze({
  search: SupportedFiltersByContext.search,
  tr_passages: SupportedFiltersByContext.textReusePassages,
  tr_clusters: SupportedFiltersByContext.textReuseClusters
})

export const SupportedIndexByContext = Object.freeze({
  search: 'search',
  textReuse: 'tr_passages',
  textReusePassages: 'tr_passages',
  textReuseClusters: 'tr_clusters'
})
