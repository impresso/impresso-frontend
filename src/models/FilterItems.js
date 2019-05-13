import Filter from '@/models/FilterBase';
import * as contexts from './Contexts';

/**
 * FilterItems is the base class for a filter having one or more items
 * @param {String} query The search query
 */
export default class FilterItems extends Filter {
  constructor({
    context = contexts.INCLUDE,
    type = 'items',
    touched = false,
    q = '',
    op = 'OR',
    items = [],
  } = {}) {
    super({ context, type, touched, q });
    this.q = String(q).split(',');
    this.qh = this.q;
    this.op = op;
    this.items = items;
    this.context = context;
  }

  setItems() {
    throw new TypeError(`Filter subclass for ${this.type} must implement setItems() method`);
  }

  getQuery() {
    const query = {
      type: this.type,
      q: this.q,
      op: this.op,
    };
    if (this.context !== contexts.INCLUDE) {
      query.context = this.context;
    }
    return query;
  }
}
