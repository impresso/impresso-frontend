/**
 * @param {import('vue/types/vue').Vue} vueInstance
 * @param {string} parameter
 * @param {string | undefined} defaultValue
 * @returns {string | undefined}
 */
export function getQueryParameter(vueInstance, parameter, defaultValue = undefined) {
  const value = vueInstance.$route.query[parameter]
  if (value == null) return defaultValue
  if (Array.isArray(value)) {
    console.warn(`"${parameter}" is listed multiple times: ${value}`)
    return /** @type {string | undefined} */ (value[0])
  }
  return value
}

export const CommonQueryParameters = Object.freeze({
  SearchFilters: 'sq',
  // LegacySearchFilters is only for bookmarks saved wth the previous
  // filtering mechanism
  LegacySearchFilters: 'f',
  // boolean: apply current search filters
  ApplyCurrentSearchFilters: 'asq',
  // string used to filter list of items
  SuggestionQuery: 'q',
  OrderBy: 'sort',
  PageNumber: 'p',
  VisualisationType: 'vis',
  VisualisationOrderBy: 'vis_sort'
})
