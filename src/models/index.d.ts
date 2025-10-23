import { SearchFacetBucket, SearchFacetRangeBucket } from './generated/schemas'

export interface FilterItem {
  id?: string
  uid: string

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

  start?: number | Date
  end?: number | Date
  // for topics
  label?: string
  excerpt?: { w: string }[]
}

export type Entity = FilterItem

export interface Filter {
  q?: string[] | string
  type: string
  context?: string
  precision?: string
  op?: string

  items?: FilterItem[]
}

export interface FilterInterface extends Filter {
  getQuery(): object
}

// New code should use either SearchFacetBucket or SearchFacetRangeBucket
export interface Bucket<T extends Entity = Entity>
  extends SearchFacetBucket,
    SearchFacetRangeBucket {
  item?: T
  val: string | number
}

// export interface Bucket {
//   val: string | number
//   count: number
//   item?: Entity

//   upper?: number
//   lower?: number
// }

export interface Facet<T extends string = FacetType> {
  type: T
  buckets: Bucket[]
  operators?: string[]
  numBuckets?: number
}

export interface SearchQuery {
  filters: Filter[]
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
  uid: string
  name: string
  type: ContentItemMeta['sourceType']
  acronym?: string
  startYear?: number
  endYear?: number
}
export interface Page {
  num: number
  uid: string
}
export interface DataProvider {
  id: string
  name?: string
}

export interface Issue {
  uid: string
  countArticles: number
  countPages: number
  date: Date
}

export interface IImage {
  uid: string
  caption?: string
  issueUid: string
  contentItemUid?: string
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
  uid: string
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
