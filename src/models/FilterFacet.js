import Bucket from '@/models/Bucket';
import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {Object} bucket The bucket
 * e.g.: { "language": [ "dutch", "french", "english" ] }
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterFacet extends Filter {
  constructor(args) {
    super(args);

    if (args.bucket instanceof Bucket) {
      this.bucket = args.bucket;
    } else {
      this.bucket = new Bucket(args.bucket);
    }
  }

  getQuery() {
    return {
      context: this.context,
      type: this.type,
      q: this.bucket.val,
    };
  }
}
