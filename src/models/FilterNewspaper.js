import Filter from '@/models/FilterBase';
import Newspaper from '@/models/Newspaper';
/**
 * FilterEntity object
 * @param {Object} bucket The bucket
 * e.g.: { "language": [ "dutch", "french", "english" ] }
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterNewspaper extends Filter {
  constructor(args) {
    super(args);
    this.newspaper = new Newspaper({
      uid: args.q,
      ...args.item,
    });
  }

  getQuery() {
    return {
      context: this.context,
      type: this.type,
      q: this.newspaper.uid,
    };
  }
}
