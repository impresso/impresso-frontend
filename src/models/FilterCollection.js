/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import Filter from '@/models/FilterBase';
import Collection from '@/models/Collection';

export default class FilterCollection extends Filter {
  constructor(args) {
    super(args);
    if (args.item instanceof Collection) {
      this.collection = args.item;
    } else {
      this.collection = new Collection(args.item);
    }
  }

  getName() {
    return this.collection.name;
  }

  getQuery() {
    return {
      context: this.context,
      type: this.type,
      q: this.collection.uid,
    };
  }
}
