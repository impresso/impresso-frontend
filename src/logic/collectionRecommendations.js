
/**
 * @typedef {import('@/models').Filter} Filter
 */

/**
 * @param {{ min_year: number, max_year: number }} param
 * @returns {Filter[]}
 */
function timeRangeRecommendationsToFilters({ min_year, max_year }) {
  return [{
    type: 'daterange',
    q: `${min_year}-01-01T00:00:00Z TO ${max_year}-12-31T23:59:59Z`
  }]
}

/**
 * @param {{ pers_counts: any[], loc_counts: any[] }} param
 * @returns {Filter[]}
 */
function namedEntitiesRecommendationsToFilters({ pers_counts, loc_counts }) {
  const personsFilter = pers_counts?.length > 0
    ? [{
      type: 'person',
      q: pers_counts.map(([id]) => id),
      op: 'OR'
    }] : []
  const locationFilter = loc_counts?.length > 0
    ? [{
      type: 'location',
      q: loc_counts.map(([id]) => id),
      op: 'OR'
    }] : []

  return [personsFilter, locationFilter].flat()
}

/**
 * @param {{ topic_weights: any[] }} param
 * @returns {Filter[]}
 */
function topicsBagRecommendationsToFilters({ topic_weights }) {
  return topic_weights?.length > 0
    ? [{
      type: 'topic',
      q: topic_weights.map(([id]) => id),
      op: 'OR'
    }] : []
}

const FilterTypeConverters = {
  TimeRange: timeRangeRecommendationsToFilters,
  NamedEntitiesBag: namedEntitiesRecommendationsToFilters,
  TopicsBag: topicsBagRecommendationsToFilters
}

/**
 * @param {any} response
 * @returns {Filter[]}
 */
export function recommenderResponseToFilters(response) {
  return response?.results?.map(({ name, params }) => {
    const fn = FilterTypeConverters[name]
    return fn != null ? fn(params) : []
  })?.flat() ?? []
}

function timeRangeRelevanceContextBuilder({ min_year, max_year }, weight) {
  return [{
    type: 'timeRange',
    parameters: { startYear: new String(min_year), endYear: new String(max_year) },
    weight
  }]
}

function namedEntitiesRelevanceContextBuilder({ pers_counts, loc_counts }, weight) {
  return [
    {
      type: 'locations',
      parameters: { entities: loc_counts?.map(([id, , w]) => ({ id, weight: w })) ?? [] },
      weight
    },
    {
      type: 'persons',
      parameters: { entities: pers_counts?.map(([id, , w]) => ({ id, weight: w })) ?? [] },
      weight
    }
  ]
}

function topicsBagRelevanceContextBuilder({ topic_weights }, weight) {
  return [{
    type: 'topics',
    parameters: { entities: topic_weights?.map(([id, , w]) => ({ id, weight: w })) ?? [] },
    weight
  }]
}

const NameToRelevanceContextBuilder = {
  TimeRange: timeRangeRelevanceContextBuilder,
  NamedEntitiesBag: namedEntitiesRelevanceContextBuilder,
  TopicsBag: topicsBagRelevanceContextBuilder
}

/**
 * @param {any} response
 * @param {any} settings
 * @returns {any}
 */
export function recommenderResponseToRelevanceContext(response, settings) {
  return response?.results?.map(({ name, params }) => {
    const fn = NameToRelevanceContextBuilder[name]
    const weight = settings.find(({ type }) => type === name)?.weight
    return fn != null ? fn(params, weight) : []
  }).flat() ?? []
}
