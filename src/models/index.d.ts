export interface Entity {
  uid: string,

  name?: string,
  language?: string,
  htmlExcerpt?: string,
  creator?: { username?: string }
  lastModifiedDate?: Date

  y?: string,

  firstIssue?: { date: Date },
  lastIssue?: { date: Date },

  countArticles?: Number,
  countIssues?: Number,

  start?: Number,
  end?: Number

  // Does it still exist? What is this for? It is used in FilterMonitor
  count?: number

  type?: String
}

export interface SuggestedEntity {
  uid: string
  type: string
  name: string
  wikidataId?: string
  matches: string[]
  countItems: number // Number of articles the entity is mentioned in
  countMentions: number // Number of times the entity is mentioned in corpus
}

export interface Filter {
  q?: string[] | string,
  type: string,
  context?: string,
  precision?: string,
  op?: string,

  items?: Entity[]
}

export interface Bucket {
  val: string,
  count: number,
  item?: Entity
}

export interface Facet {
  type: string
  buckets: Bucket[],
  operators?: string[],
  numBuckets?: number
}

export interface SearchQuery {
  filters: Filter[]
}

export interface TextReuseCluster {
  id: string
}