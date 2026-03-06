import { SearchFacetBucket, SearchFacetRangeBucket } from './generated/deprecated/models.js'
import { FacetWithLabel } from './generated/canonical.js'
import {
  Filter as ImpressoFilter,
  FilterOperator,
  SearchQuery as ImpressoSearchQuery
} from 'impresso-jscommons'

export type Filter = Omit<ImpressoFilter, 'type'> & {
  type: string
}

export interface SearchQuery<F extends Filter = Filter>
  extends Omit<ImpressoSearchQuery, 'filters'> {
  filters: F[]
}

/**
 * Backward-compatible frontend entity shape.
 * API payloads may only provide `id`/`label`, while legacy UI models use `name`,
 * date ranges and extra fields.
 */
export type Entity = Omit<FacetWithLabel, 'label'> & {
  label?: string
  name?: string
  language?: string
  htmlExcerpt?: string
  creator?: { username?: string }
  lastModifiedDate?: Date
  y?: string
  firstIssue?: { date: Date }
  lastIssue?: { date: Date }
  countArticles?: number
  countIssues?: number
  start?: number | Date | string
  end?: number | Date | string
  excerpt?: { w: string }[]
}

export type EntityWithLabelAndExcerpt = Entity & {
  label?: string
  excerpt?: { w: string }[]
}

/**
 * A frontend only extension of the Filter interface that carries additional details describing
 * the filter item. E.g. a 'person' filter with `q` containing ID may have the person entity attached.
 * It's plural because it may have multiple items when `q` contains multiple values.
 */
export type FilterWithItems<I = Entity> = Filter & {
  items?: I[]
}

/**
 * Should be done at the spot where they are used.
 */
// interface Entity {
//   id: string

//   name?: string
//   language?: string
//   htmlExcerpt?: string
//   creator?: { username?: string }
//   lastModifiedDate?: Date

//   y?: string

//   firstIssue?: { date: Date }
//   lastIssue?: { date: Date }

//   countArticles?: number
//   countIssues?: number

//   start?: number
//   end?: number
// }

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
export interface Facet<T extends string = string, I = Entity, O = FilterOperator> {
  type: T
  buckets: BucketWithItem<I>[]
  operators?: O[]
  numBuckets?: number
}

// type FilterItem = Omit<Entity, 'start' | 'end'> & {
//   start?: number | Date
//   end?: number | Date
/**
 * NOTE: this is specific to a particular filter. Should not be shared.
 */
// export type EntityWithLabelAndExcerpt = Entity & {
//   // for topics
//   label?: string
//   excerpt?: { w: string }[]
// }

/**
 * An interface that returns a clean Filter object without attached items.
 */
export interface FilterWithItemsInterface<I = Entity> extends FilterWithItems<I> {
  getQuery(): Filter
}

// New code should use either SearchFacetBucket or SearchFacetRangeBucket
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
  mediaSourceRef?: IMediaSourceRef
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
  rrrebs: Rrreb[]
  utterances: Utterance[]
}
