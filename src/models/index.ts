import {
  SearchFacetBucket,
  SearchFacetRangeBucket,
  SearchFacet as SearchFacetBase,
  ContentItemMeta
} from './generated/deprecated/models.js'
import { FacetWithLabel } from './generated/canonical.js'
import {
  Filter as BaseFilter,
  FilterOperator,
  SearchQuery as ImpressoSearchQuery,
  FilterType as FilterTypeBase,
  constants
} from 'impresso-jscommons'
import { Group } from '@/services/types/index.js'

/**
 * All supported filter types.
 * Aligned with depreciation notes in
 * https://github.com/impresso/impresso-jscommons/blob/master/proto/query.proto#L19
 */
type DeprecatedFilterType = Extract<
  FilterTypeBase,
  | 'uid' // deprecated
  // | 'issue' // deprecated, but still used in the issue page
  // | 'entity' // deprecated, but still used on the entity page
  // | 'newspaper' // deprecated, use 'mediaSource' instead
  | 'regex' // deprecated
  | 'accessRight' // deprecated, use 'copyright' instead
  | 'dataDomain' // deprecated, use 'copyright' instead
>

const DeprecatedFilterTypes = new Set<DeprecatedFilterType>([
  'uid',
  // 'issue',
  // 'entity',
  // 'newspaper',
  'regex',
  'accessRight',
  'dataDomain'
] satisfies DeprecatedFilterType[])

export type FilterType = Exclude<FilterTypeBase, DeprecatedFilterType>

export const FilterTypes: ReadonlySet<FilterType> = new Set(
  constants.filter.Types.filter(
    type => !DeprecatedFilterTypes.has(type as DeprecatedFilterType)
  ) as FilterType[]
)

type ExccludedFacetType = Extract<
  FilterType,
  'hasTextContents' // never used as a visible facet
>
const ExcludedFacetTypes = new Set<ExccludedFacetType>([
  'hasTextContents'
] satisfies ExccludedFacetType[])

/**
 * All supported facet types.
 */
export type FacetType = Exclude<FilterType, ExccludedFacetType>
export const FacetTypes: ReadonlySet<FacetType> = new Set<FacetType>(
  [...FilterTypes].filter(
    type => !ExcludedFacetTypes.has(type as ExccludedFacetType)
  ) as FacetType[]
)

export interface SearchFacet extends Omit<SearchFacetBase, 'type'> {
  type: FacetType
}

export interface Filter<T extends FilterType = FilterType> extends Omit<BaseFilter, 'type'> {
  type: T
}

export type Entity = FacetWithLabel

export interface SearchQuery<F extends Filter = Filter>
  extends Omit<ImpressoSearchQuery, 'filters'> {
  filters: F[]
}

/**
 * A frontend only extension of the Filter interface that carries additional details describing
 * the filter item. E.g. a 'person' filter with `q` containing ID may have the person entity attached.
 * It's plural because it may have multiple items when `q` contains multiple values.
 */
export type FilterWithItems<I = FacetWithLabel> = Filter & {
  items?: I[]
}

/**
 * Same as in FilterWithItems. A bucket with an optional item attached.
 */
export interface BucketWithItem<I = Entity> {
  value: string | number
  count: number
  item?: I
  label?: string
  upper?: number
  lower?: number
}

// Legacy alias used across the codebase.
export type Bucket<I = Entity> = BucketWithItem<I>

/**
 * A facet with buckets.
 */
export interface Facet<T extends FacetType = FacetType, I = Entity, O = FilterOperator> {
  type: T
  buckets: BucketWithItem<I>[]
  operators?: O[]
  numBuckets?: number
}

/**
 * An interface that returns a clean Filter object without attached items.
 * @deprecated This is not needed because any object extending it is already a Filter.
 */
export interface FilterWithItemsInterface<I = Entity> extends FilterWithItems<I> {
  getQuery(): Filter
}

/**
 * @deprecated New code should use either BucketWithItem, SearchFacetBucket or SearchFacetRangeBucket
 */
export type TermOrRangeBucketWithItem<T = Entity> = (
  | Omit<SearchFacetBucket, 'value' | 'item'>
  | SearchFacetRangeBucket
) & {
  item?: T
  value?: string | number
  label?: string
}

export interface ClusterTimeCoverage {
  from: string
  to: string
}

export interface TextReuseCluster {
  id: string
  clusterSize: number
  timeCoverage: ClusterTimeCoverage
  lexicalOverlap: number
  connectedClustersCount: number
}

export interface MediaSource {
  id: string
  name: string
  type: ContentItemMeta['sourceType']
  acronym?: string
  startYear?: number
  endYear?: number
}
export interface Page {
  num: number
  id: string
}
export interface DataProvider {
  id: string
  name?: string
}

export interface Issue {
  id: string
  countArticles: number
  countPages: number
  date: Date
}

export interface IImage {
  id: string
  caption?: string
  issueId: string
  contentItemId?: string
  previewUrl: string
  pageNumbers: number[]
  mediaSourceRef?: MediaSource
  date?: Date
}

export type User = {
  username: string
  isStaff: boolean
  firstname: string
  lastname: string
  pattern: string
  email: string
  profile?: {
    pattern: string[]
  }
  bitmap?: string
  groups?: Group[]
  agreedToTerms?: boolean
  affiliation?: string
  institutionalUrl?: string
}

export interface CollectionItem {
  //   collectionIds: Array [ "local-dg-dk0t_7Rv" ]

  // collections: Array []
  // contentType: "A"
  // itemId: "tageblatt-1923-07-06-a-i0031"
  // latestDateAdded: "2024-11-09T15:28:26.274Z"
  // searchQueries: Array []
  itemId: string
  latestDateAdded: Date
  searchQueries: SearchQuery[]
  collectionIds: string[]
}

export interface FindResponse<T> {
  data: T[]
  pagination: {
    /**
     * The total number of items matching the query
     */
    total: number
    /**
     * The number of items returned in this response
     */
    limit: number
    /**
     * Starting index of the items subset returned in this response
     */
    offset: number
  }
}

export interface Utterance {
  startTime: number
  endTime: number
  indices: number[] // indices of TranscriptPartialText contained in this utterance
}

export interface ContentItem {
  id: string
  type: 'audio' | 'ar' | 'radio_broadcast_episode'
  publicationDate: string
  title?: string
  excerpt?: string
  transcript?: string
  transcriptLength: number

  href?: string
  link?: string
  mediaSource: MediaSource
  dataProvider?: string
  copyright?: string
}

export interface AudioContentItem extends ContentItem {
  duration: number
  startTime: number
  audioSrc?: string
  audioSrcType?: 'mp3' | 'ogg' | 'wav'
  radioChannel?: string
  // rrrebs: Rrreb[]
  utterances: Utterance[]
}
