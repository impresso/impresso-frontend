import Helpers from '@/plugins/Helpers';
import FacetModel from '@/models/Facet'
import Topic from '@/models/Topic';

/**
 * @typedef {import('../models').Facet} Facet
 * @typedef {import('../models').Bucket} Bucket
 */

/**
 * @param {Facet} facet
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

/**
 * A list of default facet types to be exposed as filter facets
 * on any page that deals with filtering.
 *
 * Order matters.
 *
 * Must be valid filter names from https://github.com/impresso/impresso-middle-layer/blob/develop/src/util/solr/solrFilters.yml
 */
export const DefaultFacetTypesForIndex = Object.freeze({
  search: Object.freeze([
    'year',
    'language',
    'newspaper',
    'type',
    'country',
    'topic',
    'collection',
    'accessRight',
    'partner',
    'person',
    'location',
    'year'
  ]),
  tr_clusters: Object.freeze([
    'newspaper'
  ]),
  tr_passages: Object.freeze([
    'newspaper'
  ])
})


/**
 * @typedef {{ val: string, count: number, item?: any }} BucketData
 * @typedef {{ type: String, numBuckets: number, buckets: BucketData[] }} FacetData
 */


/**
 * @param {FacetData} facetData
 * @returns {Facet}
 */
export const facetDataToFacet = facetData => new FacetModel({
  numBuckets: 0,
  buckets: [],
  ...facetData
})

/**
 * Given a list of facet types returns an extractor function that parses
 * response from `search` service and extracts facets with buckets. Those facets
 * listed in `facetTypes` that do not exist in the search service response are created
 * as well but left empty.
 *
 * @typedef {{ info: { facets: {[key: string]: number | FacetData} } }} SearchServiceResponse
 * @param {readonly string[]} facetTypes
 * @returns {(response: SearchServiceResponse) => Facet[]}
 */
export const searchResponseToFacetsExtractor = facetTypes => response => {
  const { facets: responseFacets = {} } = response.info

  /**
   * @param {string} type
   * @returns {FacetData}
   */
  const getFacetData = type => {
    if (typeof responseFacets[type] === 'object') return /** @type {FacetData} */ (responseFacets[type])
    return { type, buckets: [], numBuckets: 0 }
  }
  const facetDataSet = facetTypes.map(type => ({
    ...getFacetData(type),
    type
  }))

  return facetDataSet.map(facetDataToFacet)
}

const DefaultEmptyApiResponse = { info: { facets: {} } }

export function buildEmptyFacets(facetTypes) {
  return searchResponseToFacetsExtractor(facetTypes)(DefaultEmptyApiResponse)
}

const LabelExtractors = {
  /** @param {Bucket} bucket */
  name: bucket => bucket?.item?.name,
  /** @param {Bucket} bucket */
  topic: bucket => {
    const item = bucket?.item != null ? new Topic(bucket.item) : bucket?.item
    return item != null
      ? `${item.language ?? 'N/A'}: ${item.htmlExcerpt}`
      : undefined
  },
  /** @param {Bucket} bucket */
  year: bucket => bucket?.item?.y ?? bucket.val,
  /**
   * @param {Bucket} bucket
   * @param {string} type
   * @param {import('vue/types/vue').Vue} vueInstance
   */
  translated: (bucket, type, vueInstance) => {
    return vueInstance.$t(`buckets.${type}.${bucket?.item?.uid ?? bucket.val}`)
  }
}

/**
 * This is derived from `ItemLabel.vue`. Given a filter return its title
 * as string (ItemLabel returns HTML). This label is useful for SVG labels.
 *
 * @param {Bucket} bucket
 * @param {string} type
 * @param {import('vue/types/vue').Vue} vueInstance
 *
 * @returns {string}
 */
export function getBucketLabel(bucket, type, vueInstance) {
  const extractor = {
    location: LabelExtractors.name,
    person: LabelExtractors.name,
    newspaper: LabelExtractors.name,
    topic: LabelExtractors.topic,
    collection: LabelExtractors.name,
    year: LabelExtractors.year
  }[type] ?? LabelExtractors.translated

  return extractor(bucket, type, vueInstance) ?? bucket.val
}
