import Bucket from '@/models/Bucket';
import Filter from '@/models/FilterBase';

/**
 * FilterEntity object
 * @param {Object} buckets Array with Bucket objects
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterFacetYear extends Filter {
  constructor(args) {
    super(args);

    this.buckets = args.buckets.map((bucket) => {
      if (bucket instanceof Bucket) {
        return bucket;
      }

      return new Bucket(bucket);
    });

    this.start = new Date(args.start || this.buckets[0].val);
    this.end = new Date(args.end || this.buckets[this.buckets.length - 1].val);
  }

  getQuery() {
    this.start.setHours(0, 0, 0, 0); // make sure we only use dates, not times
    this.end.setHours(0, 0, 0, 0);
    const daterange = `${this.start.toISOString().replace('.000Z', 'Z')} TO ${this.end.toISOString().replace('.000Z', 'Z')}`;

    return {
      context: this.context,
      type: 'daterange',
      daterange,
    };
  }
}
