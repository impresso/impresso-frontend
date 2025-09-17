import Helpers from '@/plugins/Helpers'
import FacetModel from '@/models/Facet'
import Topic from '@/models/Topic'
import { Bucket, Facet } from '../models'
import Year from '@/models/Year'
import { ComponentCustomProperties } from 'vue'

export interface TimelineValue {
  val: string
  count: number
  w: number
  w1: number
  p: number
  t: number
}

export function facetToTimelineValues(facet: FacetModel | Facet): TimelineValue[] {
  const buckets = facet instanceof FacetModel ? facet.buckets : new FacetModel(facet).buckets

  const values = buckets
    .map(b => ({
      ...b,
      w: b.count,
      w1: 0,
      p: (b.item as Year).normalize(b.count),
      t: typeof b.val === 'string' ? parseInt(b.val, 10) : b.val
    }))
    .sort((a, b) => a.t - b.t)
  return Helpers.timeline.addEmptyIntervals(values) as TimelineValue[]
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
    'organisation',
    'nag',
    'year'
  ]),
  tr_clusters: Object.freeze(['newspaper']),
  tr_passages: Object.freeze(['newspaper'])
})

export interface BucketData {
  val: string
  count: number
  item?: any
}

export interface FacetData {
  type: string
  numBuckets: number
  buckets: BucketData[]
}

export const facetDataToFacet = (facetData: FacetData) =>
  new FacetModel({
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
const searchResponseToFacetsExtractor = facetTypes => response => {
  const { facets: responseFacets = {} } = response.info

  /**
   * @param {string} type
   * @returns {FacetData}
   */
  const getFacetData = type => {
    if (typeof responseFacets[type] === 'object')
      return /** @type {FacetData} */ responseFacets[type]
    return { type, buckets: [], numBuckets: 0 }
  }
  const facetDataSet = facetTypes.map(type => ({
    ...getFacetData(type),
    type
  }))

  return facetDataSet.map(facetDataToFacet)
}

const DefaultEmptyApiResponse = { info: { facets: {} } }

export const buildEmptyFacets = facetTypes =>
  searchResponseToFacetsExtractor(facetTypes)(DefaultEmptyApiResponse)

const LabelExtractors = {
  name: (bucket?: Bucket): string | undefined => bucket?.item?.name,
  topic: (bucket?: Bucket): string | undefined => {
    const item = bucket?.item != null ? new Topic(bucket.item) : bucket?.item
    return item != null ? `${item.language ?? 'N/A'}: ${item.htmlExcerpt}` : undefined
  },
  year: (bucket?: Bucket): string | undefined => {
    const val = bucket?.item?.y ?? bucket?.val
    return val != null ? String(val) : undefined
  },
  translated: (
    bucket: Bucket | undefined,
    type: string,
    vueInstance: ComponentCustomProperties
  ) => {
    return vueInstance.$t(`buckets.${type}.${bucket?.item?.uid ?? bucket?.val}`)
  }
}

/**
 * This is derived from `ItemLabel.vue`. Given a filter return its title
 * as string (ItemLabel returns HTML). This label is useful for SVG labels.
 */
export function getBucketLabel(
  bucket: Bucket | undefined,
  type: string,
  vueInstance: ComponentCustomProperties
): string | undefined {
  const extractor =
    {
      location: LabelExtractors.name,
      person: LabelExtractors.name,
      newspaper: LabelExtractors.name,
      topic: LabelExtractors.topic,
      collection: LabelExtractors.name,
      year: LabelExtractors.year
    }[type] ?? LabelExtractors.translated

  const label = extractor(bucket, type, vueInstance) ?? bucket?.val

  return label != null ? String(label) : undefined
}
