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
    items = [],
  } = {}) {
    super({ context, type, touched, q });
    this.q = String(q).split(',');
    this.items = items;
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      context: this.context,
    };
  }
}
