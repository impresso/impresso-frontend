/**
 * FilterRegex object
 * @param {String} query The search query
 */

import Filter from '@/models/FilterBase';

export default class FilterRegex extends Filter {
  constructor(args) {
    super(args);
    this.query = String(args.query);
  }

  getQuery() {
    return {
      type: this.type,
      q: this.query,
      context: this.context,
    };
  }
}
