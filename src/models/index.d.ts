export interface Entity {
  uid: string

  name?: string
  language?: string
  htmlExcerpt?: string
  creator?: { username?: string }
  lastModifiedDate?: Date

  y?: string

  firstIssue?: { date: Date }
  lastIssue?: { date: Date }

  countArticles?: Number
  countIssues?: Number

  start?: Number
  end?: Number
}

export interface Filter {
  q?: string[] | string
  type: string
  context?: string
  precision?: string
  op?: string

  items?: Entity[]
}

export interface FilterInterface extends Filter {
  getQuery(): object
}

export interface Bucket {
  val: string
  count: number
  item?: Entity

  upper?: number
  lower?: number
}

export interface Facet {
  type: string
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
  id: string
  name: string
  type: 'newspaper' | 'radio'
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
