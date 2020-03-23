export interface Entity {
  uid: string,

  start?: Number,
  end?: Number
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
  item?: any
}

export interface Facet {
  type: string
  buckets: Bucket[],
  operators?: string[],
  numBuckets?: number
}