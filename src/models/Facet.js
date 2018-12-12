import Bucket from './Bucket';

/**
 * @class todo: is an objctet represnting different occurences of a dimension based on the query
 * @param {String} type The type of dimentions represented by the facet,
 * for instance: year/language/newspaper
 * @param {Array} buckets Array with Buckets objects
 */
export default class Facet {
  constructor({
    type = '',
    buckets = [],
  } = {}) {
    this.type = String(type);

    this.buckets = buckets.map((bucket) => {
      if (bucket instanceof Bucket) {
        return bucket;
      }

      return new Bucket(bucket);
    });
  }
}
