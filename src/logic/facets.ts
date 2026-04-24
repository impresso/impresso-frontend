import Helpers from '@/plugins/Helpers'
import FacetModel from '@/models/Facet'
import type { FacetType } from '@/models/Facet'
import Topic from '@/models/Topic'
import type { Bucket, Facet, Entity } from '../models'
import {
  isEntityWithLanguageAndExcerpt,
  isEntityWithName,
  isEntityWithYearValue
} from '@/models/typeGuards'
import Year from '@/models/Year'
import { ComponentCustomProperties } from 'vue'

export interface TimelineValue {
  value: string
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
      t: typeof b.value === 'string' ? parseInt(b.value, 10) : b.value
    }))
    .sort((a, b) => a.t - b.t)
  return Helpers.timeline.addEmptyIntervals(values) as TimelineValue[]
}

/**
 * List fo facet types that are rendered as filterable numeric range facets (e.g; [0 to 123]).
 */
export const NumericRangeFacets: FacetType[] = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'contentLength',
  'ocrQuality'
]

/** Fetched from API as timeline facet. */
export const SearchTimelineFacetTypes: FacetType[] = ['year']
export const SearchDecimalFacetTypes: FacetType[] = ['ocrQuality']
/** Used for display-side categorisation only; 'daterange' is a filter type, not fetched as a facet. */
export const SearchTimelineDisplayFacetTypes: FacetType[] = ['year', 'daterange']
/** Range facets (currently none for search). */
export const SearchRangeFacetTypes: FacetType[] = []
/** Dynamic range facets (rendered as sliders). */
export const SearchDynamicFacetTypes: FacetType[] = ['contentLength']
/** Standard filterable facets shown in the sidebar. */
export const SearchStandardFacetTypes: FacetType[] = [
  'language',
  'newspaper',
  // 'mediaSource',
  'type',
  'country',
  'partner',
  // 'year',
  'copyright',
  'sourceType',
  'sourceMedium',
  // DPFS facets
  'person',
  'location',
  'nag',
  'organisation',
  'topic'
]
/** User-specific facets that require authentication. */
export const SearchUserFacetTypes: FacetType[] = ['collection']

export const TextReuseStandardFacetTypes: FacetType[] = [
  'textReuseCluster',
  'newspaper',
  'topic',
  // 'collection',
  // 'year',
  'country',
  // 'type',
  'language',
  'person',
  'location',
  'organisation',
  'nag',
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta'
]
/**
 * A list of facet types that are displayed as standard filterable facets, e.g; checkboxes, in the sidebar.
 * Order matters.
 */
export const StandardDisplayFacetTypes: FacetType[] = [
  'language',
  'newspaper',
  'mediaSource',
  'type',
  'country',
  'partner',
  'copyright',
  'sourceType',
  'sourceMedium',
  // DPFS facets
  'person',
  'location',
  'nag',
  'organisation',
  'topic',
  // image mostly
  'imageVisualContent',
  'imageTechnique',
  'imageCommunicationGoal',
  'imageContentType'
]
/**
 * A list of facet types that requires stats to be loaded before showing them.
 * Order matters.
 */
export const DynamicRangeDisplayFacetTypes: FacetType[] = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'contentLength'
]
/**
 * A list of facet types that are rendered as filterable numeric (float )range facets (e.g; [0.00 to 123.00])
 * and require stats to be loaded before showing them.
 */
export const DecimalRangeDisplayFacetTypes: FacetType[] = ['ocrQuality']
/**
 * A list of facet types that are rendered as range facets (e.g; a slider with min and max values). Order matters.
 */
export const RangeFacetTypes: FacetType[] = []
/**
 * A list of facet types that are rendered as timeline facets (e.g; a timeline with points representing buckets). Order matters.
 */
export const TimelineDisplayFacetTypes: FacetType[] = ['year', 'daterange']

/**
 * A list of default facet types to be exposed as filter facets
 * on any page that deals with filtering.
 *
 * Order matters.
 *
 * Must be valid filter names from https://github.com/impresso/impresso-middle-layer/blob/develop/src/util/solr/solrFilters.yml
 */
export const DefaultFacetTypesForIndex = {
  search: [
    'year',
    'language',
    'newspaper',
    'mediaSource',
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
  ],
  tr_clusters: ['newspaper'],
  tr_passages: ['newspaper']
} as const

export interface BucketData {
  value: string
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
  name: (bucket?: Bucket<Entity>): string | undefined => {
    return isEntityWithName(bucket?.item) ? bucket?.item.name : bucket?.item?.label
  },
  topic: (bucket?: Bucket<Entity>): string | undefined => {
    if (!isEntityWithLanguageAndExcerpt(bucket?.item)) {
      return bucket?.item?.label
    }
    const item = new Topic(bucket.item)
    return `${item.language ?? 'N/A'}: ${item.htmlExcerpt ?? item.label}`
  },
  year: (bucket?: Bucket<Entity>): string | undefined => {
    const val = isEntityWithYearValue(bucket?.item) ? bucket.item.y : bucket?.value
    return val != null ? String(val) : undefined
  },
  translated: (
    bucket: Bucket<Entity> | undefined,
    type: string,
    vueInstance: ComponentCustomProperties
  ) => {
    return vueInstance.$t(`buckets.${type}.${bucket?.item?.id ?? bucket?.value}`)
  }
}

/**
 * This is derived from `ItemLabel.vue`. Given a filter return its title
 * as string (ItemLabel returns HTML). This label is useful for SVG labels.
 */
export function getBucketLabel(
  bucket: Bucket<Entity> | undefined,
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

  const label = extractor(bucket, type, vueInstance) ?? bucket?.value

  return label != null ? String(label) : undefined
}
