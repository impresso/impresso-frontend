import { deserializeFilters } from './filters'

/**
 * @typedef {import('@/models').Filter} Filter
 */

const LatestSearchQueryKey = 'impressoLatestSearchQuery'

/**
 * Return latest search query from the store
 * @returns {string}
 */
export function getLatestSerializedSearchQuery() {
  // @ts-expect-error localStorage is only called in the browser
  return localStorage.getItem(LatestSearchQueryKey)
}

/**
 * Return latest filters from the store
 * @returns {Filter[]}
 */
export function getLatestFilters() {
  return deserializeFilters(getLatestSerializedSearchQuery())
}

/**
 * Store latest serialized search query the store
 * @param {string} searchQuery
 */
export function setLatestSerializedSearchQuery(searchQuery) {
  // @ts-expect-error localStorage is only called in the browser
  localStorage.setItem(LatestSearchQueryKey, searchQuery)
}
