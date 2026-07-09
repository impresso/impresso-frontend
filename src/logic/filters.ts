import { FacetType, Filter, FilterType } from '@/models'
import { protobuf, constants } from 'impresso-jscommons'
import { RangeFacets } from './facets'
import { includes } from '@/util/fn'

export function toCanonicalFilter<T extends FilterType>(filter: Filter<T>): Filter<T> {
  const { context, op, type, precision, q, uids } = filter ?? {}
  return { context, op, type, precision, q, uids }
}

export function toSerializedFilter<T extends FilterType>(filter: Filter<T>): string {
  return protobuf.filter.serialize(toCanonicalFilter(filter))
}

export function toSerializedFilters<T extends FilterType>(filters?: Filter<T>[]): string {
  return protobuf.searchQuery.serialize({ filters: filters?.map(toCanonicalFilter) ?? [] })
}

export const NumericRangeFilters = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'contentLength',
  'ocrQuality'
] satisfies FilterType[]

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
const omitBy = <T>(object: T, fn: (value: any) => boolean): T =>
  Object.keys(object).reduce((acc, key) => {
    const value = object[key]
    if (!fn(value)) acc[key] = value
    return acc
  }, {}) as T

/**
 * Optimize filters by merging filters of the same type with the same
 * context/precision where possible.
 */
export function optimizeFilters(filters: Filter[]): Filter[] {
  if (!Array.isArray(filters)) {
    console.error('optimizeFilters: filters is not an array', filters)
    return []
  }
  if (filters.length === 0) return []
  const groupingMap = filters.reduce((map, filter, i) => {
    let key = getFilterMergeKey(filter)
    // DO NOT GROUP range filters together
    if (includes(RangeFacets, filter.type)) {
      key += `-${i}`
    }
    if (filter.type === 'string') {
      key += `-${i}`
    }

    const items = map.get(key) ?? []
    map.set(key, items.concat([filter]))
    return map
  }, new Map<string, Filter[]>())

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
 * Facets and filters by context.
 * Usually there are more facets than filters (some filters are hidden)
 * Top to bottom as they are rendered in the UI.
 */

export const TextContentItemFacets = [
  'language',
  'mediaSource',
  'type',
  'country',
  'partner',
  'copyright',
  'sourceType',
  'sourceMedium',
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
] as const satisfies FilterType[]

export const NumericContentItemsFacets = [
  'ocrQuality',
  'contentLength'
] as const satisfies FilterType[]

const TextSearchFacets = [
  'daterange',
  'year',
  ...NumericContentItemsFacets,
  ...TextContentItemFacets,
  'collection'
] as const satisfies FilterType[]

const TextSearchFilters = [
  ...TextSearchFacets,
  'string',
  'isFront',
  'hasTextContents', // invisible filter - always applied
  'title', // do we use it?
  'page', // should become a facet
  'year',
  'mention',
  'entity',
  'textReuseCluster', // ??
  'embedding',
  'mediaSource' // to replace 'newspaper' eventually
] as const satisfies FilterType[]

export const TextReuseContentItemFacets = [
  'language',
  'newspaper', // should be mediaSource eventually
  // 'type',
  'country',
  // 'partner',
  // 'copyright',
  // 'sourceType',
  // 'sourceMedium',
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
] as const satisfies FilterType[]

export const TextReuseNumericFacets = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta'
] as const satisfies FilterType[]

export const TextReuseFacets = [
  ...TextReuseContentItemFacets,
  ...TextReuseNumericFacets
] as const satisfies FilterType[]

const TextReuseFilters = [...TextReuseFacets, 'textReuseCluster', 'daterange']

const TextReuseClusterFilters = [
  'textReuseCluster',
  ...TextReuseNumericFacets,
  'newspaper'
] as const satisfies FilterType[]

const EntitiesFilters = ['string', 'type'] as const satisfies FilterType[]

const ImagesFacets = [
  'newspaper',
  'year',
  'imageVisualContent',
  'imageTechnique',
  'imageCommunicationGoal',
  'imageContentType'
] as const satisfies FilterType[]

const ImagesFilters = [
  ...ImagesFacets,
  'isFront',
  'daterange',
  'title'
] as const satisfies FilterType[]

export const FacetsByContext = Object.freeze({
  search: TextSearchFacets,
  textReusePassages: TextReuseFacets,
  images: ImagesFacets
})

/**
 * Impresso has several indexes each supporting a different set of filters.
 * This lookup table below should be used to pick only those filters that are
 * supported by the particular search service. Using filters that are not supported
 * by a service will cause the API to return an error.
 */
export const SupportedFiltersByContext = Object.freeze({
  search: TextSearchFilters,
  textReusePassages: TextReuseFilters,
  textReuseClusters: TextReuseClusterFilters,
  entities: EntitiesFilters,
  images: ImagesFilters
})

export const SupportedFiltersByIndex = Object.freeze({
  search: SupportedFiltersByContext.search,
  tr_passages: SupportedFiltersByContext.textReusePassages,
  tr_clusters: SupportedFiltersByContext.textReuseClusters
})
