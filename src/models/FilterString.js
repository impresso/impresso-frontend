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
    this.query = String(args.query);
    this.precision = precisions[(args.precision || 'regular').toUpperCase()];
  }

  getQuery() {
    return {
      context: this.context,
      precision: this.precision,
      type: this.type,
      q: this.query,
    };
  }
}
