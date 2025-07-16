import Bucket from './Bucket'

/**
 * @class todo: is an objctet represnting different occurences of a dimension based on the query
 * @param {String} type The type of dimentions represented by the facet,
 * for instance: year/language/newspaper
 * @param {Array} buckets Array with Buckets objects
 */
export default class Facet {
  type: string
  buckets: Bucket[]
  operators: string[]
  numBuckets: number

  constructor({ type = '', buckets = [], operators = [], numBuckets = -1 } = {}) {
    this.type = String(type)
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
}
