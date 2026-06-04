import { FilterOperator } from 'impresso-jscommons'
import Bucket from './Bucket'
import { type Facet as IFacet, type Entity, FacetType, SearchFacet } from './index'

/**
 * @class todo: is an objctet represnting different occurences of a dimension based on the query
 * @param {String} type The type of dimentions represented by the facet,
 * for instance: year/language/newspaper
 * @param {Array} buckets Array with Buckets objects
 */
export default class Facet<T extends FacetType = FacetType> implements IFacet<T, Entity> {
  type: T
  buckets: Bucket[]
  operators: FilterOperator[]
  numBuckets: number

  constructor({
    type,
    buckets = [],
    operators = [],
    numBuckets = -1
  }: {
    type: T
    buckets?: Bucket[]
    operators?: FilterOperator[]
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

  static fromSearchFacet<T extends FacetType = FacetType>(facet: SearchFacet) {
    return new Facet<T>({
      type: facet.type as T,
      buckets: (facet.buckets || []).map(
        bucket => new Bucket({ ...bucket, type: facet.type as T })
      ),
      numBuckets: facet.numBuckets
    })
  }
}
