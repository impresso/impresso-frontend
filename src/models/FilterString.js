/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import Filter from '@/models/FilterBase';
import * as precisions from './Precisions';
import * as contexts from './Contexts';

export default class FilterString extends Filter {
  constructor(args) {
    super(args);
    this.q = String(args.q || args.query);
    this.precision = precisions[(args.precision || 'exact').toUpperCase()];
    this.distance = Math.max(0, Math.min(parseInt(args.distance || 0, 10), 10));
  }

  getQuery() {
    const query = {
      type: this.type,
      q: this.q,
      precision: this.precision,
    };

    if (this.distance !== 0) {
      query.distance = this.distance;
    }
    if (this.context !== contexts.INCLUDE) {
      query.context = this.context;
    }
    return query;
  }
}
