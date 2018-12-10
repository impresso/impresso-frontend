import Bucket from './Bucket';
/**
 * FilterEntity object
 * @param {Object} buckets Array with Bucket objects
 * e.g.: { "language": [ "dutch", "french", "english" ] }
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterFacet {
  constructor({
    buckets = {},
    type = '',
    touched = false,
  } = {}) {
    this.type = type;
    this.context = 'include';
    this.touched = touched;

    this.buckets = buckets.map((bucket) => {
      if (bucket instanceof Bucket) {
        return bucket;
      }

      return new Bucket(bucket);
    });
  }

  getQuery() {
    const filters = this.buckets.filter(bucket => bucket.included);

    if (filters.length > 0 && this.touched) {
      return {
        context: this.context,
        type: this.type,
        q: filters.map(bucket => bucket.val),
      };
    }

    return null;
  }

  touch() {
    this.touched = true;
  }

  untouch() {
    this.touched = false;
  }
}
