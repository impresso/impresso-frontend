import SearchQuery from '@/models/SearchQuery'
import { CommonQueryParameters } from '@/router/util'
import { deserializeFilters, serializeFilters } from '@/logic/filters'
import {
  getLatestSerializedSearchQuery,
  setLatestSerializedSearchQuery
} from './storage'

/**
 * This file contains computed properties mapping for SearchQuery/Filters[].
 * Computed properties mapping works the same as `mapState` in Vuex (https://vuex.vuejs.org/guide/state.html#the-mapstate-helper).
 * Unlike Vuex here we map SearchQuery/Filters[] to a generic query parameter and storage:
 * - Whenever SearchQuery/Filters[] computed property is accessed, the mapping attempts to
 *   get them from the URL query parameters. If they are not present there, the mapping looks
 *   for the last stored query in localStorage.
 * - Whenever  SearchQuery/Filters[] computed property is mutated the mapping stores the filters
 *   in a generic URL query parameter and also in localStorage.
 *
 * There are two mapping functions:
 * - `mapSearchQuery` which works with `SearchQuery` model. This model is mostly used on SearchPage only.
 * - `mapFilters` which works with `Filter[]` list. It is used in most of the other parts of the app.
 *
 * Both `SearchQuery` and `Filter[]` are serialized to a protobuf base64 string using the same
 * container (see https://github.com/impresso/impresso-jscommons/blob/master/proto/query.proto#L83) therefore
 * they are completely interchangeable.
 */

/**
 * @typedef {import('@/models').Filter} Filter
 */

/**
 * Get serialised `SearchQuery` from a query parameter.
 * @param {import('vue-router').Route} route
 * @return {string}
 */
const getSearchQueryFromQueryParameterOrLocalStorage = route => {
  const { [CommonQueryParameters.SearchFilters]: sq } = route?.query;
  if (Array.isArray(sq) && sq[0] != null) return sq[0]
  if (!Array.isArray(sq) && sq != null) return sq

  return getLatestSerializedSearchQuery() ?? ''
}

export const searchQueryHashGetter = () => {
  /**
   * @this {import('vue/types/vue').Vue}
   */
  const fn = function() { return getSearchQueryFromQueryParameterOrLocalStorage(this.$route) }
  return fn
}

/**
 * @typedef {() => SearchQuery} SearchQueryGetter
 * @returns {{ get: SearchQueryGetter }}
 */
export const searchQueryGetter = () => {
  /** @this {import('vue/types/vue').Vue} */
  const get = function() {
    const sq = getSearchQueryFromQueryParameterOrLocalStorage(this.$route);
    if (sq.length) {
      return SearchQuery.deserialize(sq);
    }
    return new SearchQuery();
  }
  return { get };
};

/**
 * `additionalQueryParams` - extra query parameters to set when filter changes
 * @typedef {{
 *  additionalQueryParams?: { [key: string]: string }
 * }} SetterMapOptions
 * @typedef {(query: SearchQuery) => void} SearchQuerySetter
 *
 * @param {SetterMapOptions} options extra options for the mapping
 * @returns {{ set: SearchQuerySetter }}
 */
export const searchQuerySetter = ({ additionalQueryParams = {} } = {}) => {
  /**
   * @this {import('vue/types/vue').Vue}
   * @param {SearchQuery} searchQuery
   */
  const set = function(searchQuery) {
    // update searchquery in the store so that the current sq
    // hash in the local storage gets updated, too.
    const sq = /** @type {string} */ (searchQuery.getSerialized({ serializer: 'protobuf' }))
    setLatestSerializedSearchQuery(sq)
    this.$navigation.updateQueryParametersWithHistory({
      ...additionalQueryParams,
      [CommonQueryParameters.SearchFilters]: sq,
    });
  }
  return { set };
};

export const mapSearchQuery = () => ({
  ...searchQueryGetter(),
  ...searchQuerySetter(),
});

/**
 * @param {SetterMapOptions} options extra options for the mapping
 */
export const mapFilters = ({ additionalQueryParams = {} } = {}) => {
  /** @this {import('vue/types/vue').Vue} */
  const get = function() {
    return deserializeFilters(
      getSearchQueryFromQueryParameterOrLocalStorage(this.$route)
    )
  }

  /**
   * @this {import('vue/types/vue').Vue}
   * @param {Filter[]} filters
   */
  const set = function(filters) {
    const sq = serializeFilters(filters)
    setLatestSerializedSearchQuery(sq)
    this.$navigation.updateQueryParametersWithHistory({
      ...additionalQueryParams,
      [CommonQueryParameters.SearchFilters]: sq,
    });
  }

  return { get, set }
}