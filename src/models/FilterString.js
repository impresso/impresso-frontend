/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import Filter from '@/models/FilterBase';
import * as precisions from './Precisions';

export default class FilterString extends Filter {
  constructor(args) {
    super(args);
    this.q = String(args.q || args.query);
    this.precision = precisions[(args.precision || 'exact').toUpperCase()];
  }

  getQuery() {
    return {
      context: this.context,
      precision: this.precision,
      type: this.type,
      q: this.q,
    };
  }
}
