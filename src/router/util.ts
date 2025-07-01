import type { RouteLocationNormalizedLoaded } from 'vue-router'

export function getQueryParameter(
  vueInstance: { $route: RouteLocationNormalizedLoaded },
  parameter: string,
  defaultValue: string | undefined = undefined
): string | undefined {
  const value = vueInstance.$route.query[parameter]
  if (value == null) return defaultValue
  if (Array.isArray(value)) {
    console.warn(`"${parameter}" is listed multiple times: ${value}`)
    return value[0] as string | undefined
  }
  return value as string | undefined
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
  VisualisationOrderBy: 'vis_sort',
  LegacyArticleId: 'articleId',
  ContentItemId: 'contentItemId'
})
