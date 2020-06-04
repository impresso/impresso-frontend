import { entitiesSuggestions as entitiesSuggestionsService } from '@/services'

/**
 * @typedef {import('@/models').Entity} Filter
 * @typedef {import('@/models').Entity} Entity
 * @typedef {import('@/models').SuggestedEntity} SuggestedEntity
 */

/**
 * @param {Entity[]} entities
 * @returns {Promise<SuggestedEntity[]>}
 */
export async function getSuggestedEntities(entities) {
  if (entities.length === 0) return [];

  const names = entities.map(({ name }) => name);
  const inputEntitiesIds = entities.map(({ uid }) => uid)

  return await entitiesSuggestionsService
    .create({ names })
    .then(res => res.results.filter(({ uid }) => !inputEntitiesIds.includes(uid)))
}

/**
 * @param {Entity[]} entities
 * @param {Filter[]} filters
 * @returns {Promise<SuggestedEntity[]>}
 */
// eslint-disable-next-line no-unused-vars
export async function getCoOccurringEntities(entities, filters) {
  return []
}
