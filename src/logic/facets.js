import Helpers from '@/plugins/Helpers';
import Facet from '@/models/Facet'

/**
 * Given a search API response return a list of facets with buckets.
 * @param {any} apiResponseFacets
 * @returns {import('../models').Facet[]}
 */
export function getFacetsFromApiResponse(apiResponseFacets = {}, operatorsMap = {}) {
  const facetTypes = Object.keys(apiResponseFacets).filter(v => v !== 'count')

  return facetTypes.map(type => {
    const { buckets = [], numBuckets = 0 } = apiResponseFacets[type]
    return new Facet({
      type,
      buckets,
      numBuckets,
      operators: operatorsMap[type] || ['OR']
    })
  })
}

/**
 * @param {import('../models').Facet} facet
 * @returns {{ val: string, count: number, w: number, w1: number, p: number, t: number }[]}
 */
export function facetToTimelineValues(facet) {
  const values = facet.buckets.map(d => ({
    ...d,
    w: d.count,
    w1: 0,
    p: d.item.normalize(d.count),
    t: parseInt(d.val, 10),
  })).sort((a , b) => a.t - b.t);
  return Helpers.timeline.addEmptyIntervals(values)
}