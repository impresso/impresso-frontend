
/**
 * @typedef {import('@/models').Filter} Filter
 */


/**
 * Recommender Id to recommender names used in "request" to recommender endpoint.
 */
export const RecommenderNameMap = Object.freeze({
  timeRange: 'TimeRangeRecommender',
  entities: 'NamedEntitiesRecommender',
  topics: 'TopicsRecommender',
  textReuseClusters: 'TextReuseRecommender'
})

/**
 * Recommender Id to recommender tags used in "response" from recommender endpoint.
 */
export const RecommenderResponseTagMap = Object.freeze({
  timeRange: 'TimeRange',
  entities: 'NamedEntitiesBag',
  topics: 'TopicsBag',
  textReuseClusters: 'TextReuseClusterBag'
})

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

/**
 * @param {{ cluster_weights: any[] }} param
 * @returns {Filter[]}
 */
function textReuseClusterBagRecommendationsToFilters({ cluster_weights }) {
  return cluster_weights?.length > 0
    ? [{
      type: 'textReuseCluster',
      q: cluster_weights.map(([id]) => id),
      op: 'OR'
    }] : []
}

const FilterTypeConverters = {
  TimeRange: timeRangeRecommendationsToFilters,
  NamedEntitiesBag: namedEntitiesRecommendationsToFilters,
  TopicsBag: topicsBagRecommendationsToFilters,
  TextReuseClusterBag: textReuseClusterBagRecommendationsToFilters
}

/**
 * @param {any} response
 * @param {any} settings
 * @returns {Filter[]}
 */
export function recommenderResponseToFilters(response, settings) {
  return response?.results?.map(({ name, params }) => {
    const fn = FilterTypeConverters[name]
    const recommenderEnabled = settings.find(({ type }) => RecommenderResponseTagMap[type] === name)?.enabled

    if (!recommenderEnabled) return []

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

function textReuseClusterBagRelevanceContextBuilder({ cluster_weights }, weight) {
  return [{
    type: 'textReuseClusters',
    parameters: { entities: cluster_weights?.map(([id, w]) => ({ id, weight: w })) ?? [] },
    weight
  }]
}

const NameToRelevanceContextBuilder = {
  TimeRange: timeRangeRelevanceContextBuilder,
  NamedEntitiesBag: namedEntitiesRelevanceContextBuilder,
  TopicsBag: topicsBagRelevanceContextBuilder,
  TextReuseClusterBag: textReuseClusterBagRelevanceContextBuilder
}

/**
 * @param {any} response
 * @param {any} settings
 * @returns {any}
 */
export function recommenderResponseToRelevanceContext(response, settings) {
  return response?.results?.map(({ name, params }) => {
    const fn = NameToRelevanceContextBuilder[name]
    const recommenderSettings = settings.find(({ type }) => RecommenderResponseTagMap[type] === name)
    const recommenderEnabled = recommenderSettings?.enabled
    if (!recommenderEnabled) return []

    const weight = recommenderSettings?.weight
    return fn != null ? fn(params, weight) : []
  }).flat() ?? []
}

const ApiParametersMapping = Object.freeze({
  countType: 'count_type',
  removeFullyMentioned: 'remove_fully_mentionned',
  minOccurrences: 'min_occurences',
  numberToKeep: 'nb_to_keep',
  normalizeMaxScore: 'normalize_max_score',
  scalingFactor: 'scaling_factor'
})

/**
 * Change names of parameters to the names that API understands.
 * The API uses snake case and has some typos.
 * @param {any} parameters
 * @returns {any}
 */
export function parametersToApiRequestParameters(parameters) {
  return Object.entries(parameters).reduce((acc, [key, value]) => {
    const k = ApiParametersMapping[key] ?? key
    return {
      ...acc,
      [k]: value
    }
  }, {})
}