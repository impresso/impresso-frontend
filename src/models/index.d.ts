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
