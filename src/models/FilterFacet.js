import Bucket from '@/models/Bucket';
import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {Object} buckets Array with Bucket objects
 * e.g.: { "language": [ "dutch", "french", "english" ] }
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterFacet extends Filter {
  constructor(args) {
    super(args);
    this.buckets = args.buckets.map((bucket) => {
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
}
