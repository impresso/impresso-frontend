/**
 * FilterTopic object
 * @param {String} query The search query
 */

import Filter from '@/models/FilterBase';

export default class FilterTopic extends Filter {
  constructor(args) {
    super(args);
    console.log(args);
    this.h = String(args.h);
    this.query = String(args.q);
    this.precision = String(args.precision);
    this.item = args.item;
  }

  getQuery() {
    return {
      type: this.type,
      q: this.query,
      context: this.context,
    };
  }
}
