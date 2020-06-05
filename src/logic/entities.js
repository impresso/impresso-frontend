import {
  entitiesSuggestions as entitiesSuggestionsService,
  searchFacets as searchFacetsService
} from '@/services'

const EntitiesTypes = [
  'entity',
  'person',
  'location'
]

/**
 * @typedef {import('@/models').Filter} Filter
 * @typedef {import('@/models').Entity} Entity
 * @typedef {import('@/models').SuggestedEntity} SuggestedEntity
 */

/**
 * @param {Entity[]} entities
 * @returns {Promise<SuggestedEntity[]>}
 */
export async function getSimilarEntities(entities) {
  if (entities.length === 0) return [];

  const names = entities.map(({ name }) => name);
  const inputEntitiesIds = entities.map(({ uid }) => uid)

  return await entitiesSuggestionsService
    .create({ names })
    .then(res => res.results.filter(({ uid }) => !inputEntitiesIds.includes(uid)))
}

/**
 * WIP: A separate endpoint is needed that is able to retrieve
 * entities of all types and get their details.
 * Right now some fields are mocked up.
 *
 * @param {{ entities: Entity[], filters: Filter[] }} param
 * @returns {Promise<SuggestedEntity[]>}
 */
export async function getCoOccurringEntities({ entities, filters }) {

  const filtersWithoutEntities = filters.filter(({ type }) => !EntitiesTypes.includes(/** @type {string} */ (type)));
  const currentEntitiesFilter = /** @type {Filter} */ ({
    type: 'entity',
    op: 'OR',
    q: entities.map(({ uid }) => uid)
  })

  const currentFilters = (currentEntitiesFilter.q ?? []).length > 0
    ? filtersWithoutEntities.concat([currentEntitiesFilter])
    : filtersWithoutEntities

  const query = {
    filters: currentFilters,
    group_by: 'articles',
    limit: 10
  }

  const results = await Promise.all([
    searchFacetsService.get('person', { query }),
    searchFacetsService.get('location', { query })
  ])

  const inputEntitiesIds = entities.map(({ uid }) => uid)

  return results
    .map(result => result[0].buckets.map(({ item, count }) => [item, count]))
    .flat()
    .sort((a, b) => b[1] - a[1])
    .map(([{ name, type, uid }, count]) => ({
      uid,
      name,
      type,
      matches: [ name ],
      countItems: count,
      countMentions: count
    }))
    .filter(({ uid }) => !inputEntitiesIds.includes(uid))
}
