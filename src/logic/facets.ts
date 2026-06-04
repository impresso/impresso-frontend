import Helpers from '@/plugins/Helpers'
import FacetModel from '@/models/Facet'
import Topic from '@/models/Topic'
import type { Bucket, Facet, Entity, FacetType } from '../models'
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
 * A list of facet types that requires stats to be loaded before showing them.
 */
export const DynamicRangeDisplayFacetTypes = [
  'textReuseClusterSize',
  'textReuseClusterLexicalOverlap',
  'textReuseClusterDayDelta',
  'contentLength'
] as const satisfies FacetType[]

/**
 * List fo facet types that are rendered
 * as filterable numeric range facets (e.g; [0 to 123]).
 */
export const NumericRangeFacets = [
  ...DynamicRangeDisplayFacetTypes,
  'ocrQuality'
] as const satisfies FacetType[]

export const TimeRangeFacets = ['daterange'] as const satisfies FacetType[]

export const RangeFacets = [
  ...NumericRangeFacets,
  ...TimeRangeFacets
] as const satisfies FacetType[]

/** Fetched from API as timeline facet. */
export const SearchDecimalFacetTypes = ['ocrQuality'] as const satisfies FacetType[]
/** Dynamic range facets (rendered as sliders). */
export const SearchDynamicFacetTypes = ['contentLength'] as const satisfies FacetType[]

/**
 * A list of facet types that are rendered as filterable numeric (float )range facets (e.g; [0.00 to 123.00])
 * and require stats to be loaded before showing them.
 */
export const DecimalRangeDisplayFacetTypes = ['ocrQuality'] as const satisfies FacetType[]
/**
 * A list of facet types that are rendered as range facets (e.g; a slider with min and max values). Order matters.
 */
export const RangeFacetTypes = [] as const satisfies FacetType[]
/**
 * A list of facet types that are rendered as timeline facets (e.g; a timeline with points representing buckets). Order matters.
 */
export const TimelineDisplayFacetTypes = ['year', 'daterange'] as const satisfies FacetType[]

export interface BucketData {
  value: string
  count: number
  item?: any
}

export interface FacetData {
  type: FacetType
  numBuckets: number
  buckets: BucketData[]
}

export const facetDataToFacet = (facetData: FacetData) =>
  new FacetModel({
    numBuckets: 0,
    buckets: [],
    ...facetData
  })

type SearchServiceResponse = {
  info: {
    facets: {
      [key: string]: number | FacetData
    }
  }
}

/**
 * Given a list of facet types returns an extractor function that parses
 * response from `search` service and extracts facets with buckets. Those facets
 * listed in `facetTypes` that do not exist in the search service response are created
 * as well but left empty.
 *
 */
const searchResponseToFacetsExtractor =
  <T extends FacetType>(facetTypes: T[]) =>
  (response: SearchServiceResponse) => {
    const { facets: responseFacets = {} } = response.info

    const getFacetData = (type: T) => {
      if (typeof responseFacets[type] === 'object') return responseFacets[type] as FacetData
      return { type, buckets: [], numBuckets: 0 } satisfies FacetData
    }
    const facetDataSet = facetTypes.map(type => ({
      ...getFacetData(type),
      type
    }))

    return facetDataSet.map(facetDataToFacet)
  }

const DefaultEmptyApiResponse = { info: { facets: {} } }

export const buildEmptyFacets = <T extends FacetType>(facetTypes: T[]) =>
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
