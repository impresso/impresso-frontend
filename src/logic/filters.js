import { protobuf } from 'impresso-jscommons'

/**
 * @typedef {import('../models').Filter} Filter
 */

export function toCanonicalFilter(filter) {
  const {
    context,
    op,
    type,
    precision,
    q,
    daterange,
    uids
  } = filter || {}
  return { context, op, type, precision, q, daterange, uids }
}

export function toSerializedFilter(filter) {
  return protobuf.filter.serialize(toCanonicalFilter(filter))
}

export function toSerializedFilters(filters) {
  return protobuf.searchQuery.serialize({ filters: filters.map(toCanonicalFilter) })
}

export const NumericRangeFacets = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta'
]

export const TimeRangeFacets = [
  'daterange'
]

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
const omitBy = (object, fn) => Object.keys(object).reduce((acc, key) => {
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
  const groupingMap = filters.reduce((map, filter) => {
    const key = getFilterMergeKey(filter)
    const items = map.get(key) || []
    map.set(key, items.concat([filter]))
    return map
  }, new Map());
  return [...groupingMap.entries()]
    .map(([, filters]) => {
      const { type, context, precision, op } = filters[0];
      const q = filters
        .flatMap(({ q }) => {
          return Array.isArray(q) ? q : [q]
        })
        .filter(value => value != null)

      return omitBy({
        type,
        context,
        precision,
        op,
        q: q.length > 1 ? q : q[0]
      }, value => value == null)
    })
}