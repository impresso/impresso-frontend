import Bucket from './Bucket'
import { SearchFacet } from './generated/schemas'

/**
 * All supported facet types.
 * TODO: load from impresso-jscommons.
 */
export type FacetType =
  | 'topic'
  | 'textReuseCluster'
  | 'textReusePassage'
  | 'collection'
  | 'year'
  | 'type'
  | 'country'
  | 'language'
  | 'newspaper'
  | 'person'
  | 'location'
  | 'sourceType'
  | 'sourceMedium'
  | 'dataDomain'
  | 'copyright'
  | 'partner'
  | 'contentLength'
  | 'nag'
  | 'organisation'

/**
 * Read-only array of all supported facet types.
 * TODO: load from impresso-jscommons.
 */
export const FacetTypes: ReadonlyArray<FacetType> = Object.freeze([
  ...new Set<FacetType>([
    'topic',
    'textReuseCluster',
    'textReusePassage',
    'collection',
    'year',
    'type',
    'country',
    'language',
    'newspaper',
    'person',
    'location',
    'sourceType',
    'sourceMedium',
    'dataDomain',
    'copyright',
    'partner',
    'contentLength'
  ])
] as const)

// Type assertion to ensure all FacetType values are included exactly once
type EnsureExhaustive<T extends readonly FacetType[]> = {
  [K in FacetType]: T extends readonly [...infer Pre, K, ...infer Post]
    ? Pre | Post extends readonly K[]
      ? 'Duplicate type detected'
      : unknown
    : 'Missing type detected'
}
type _TypeCheck = EnsureExhaustive<typeof FacetTypes>

/**
 * @class todo: is an objctet represnting different occurences of a dimension based on the query
 * @param {String} type The type of dimentions represented by the facet,
 * for instance: year/language/newspaper
 * @param {Array} buckets Array with Buckets objects
 */
export default class Facet<T = FacetType> {
  type: T
  buckets: Bucket[]
  operators: string[]
  numBuckets: number

  constructor({
    type,
    buckets = [],
    operators = [],
    numBuckets = -1
  }: {
    type: T
    buckets?: Bucket[]
    operators?: string[]
    numBuckets?: number
  }) {
    this.type = type
    if (!operators.length) {
      this.operators = ['OR']
    } else {
      this.operators = operators
    }
    this.numBuckets = typeof numBuckets === 'number' ? numBuckets : parseInt(numBuckets, 10)
    if (buckets.length) {
      this.setBuckets(buckets)
    } else {
      this.buckets = []
    }
  }

  setBuckets(buckets) {
    this.buckets = buckets.map(bucket => {
      if (bucket instanceof Bucket) {
        return bucket
      }
      return new Bucket({
        ...bucket,
        type: this.type
      })
    })
  }

  static fromSearchFacet(facet: SearchFacet) {
    return new Facet({
      type: facet.type as FacetType,
      buckets: (facet.buckets || []).map(bucket => new Bucket(bucket)),
      numBuckets: facet.numBuckets
    })
  }
}
