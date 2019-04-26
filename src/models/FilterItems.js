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
    this.op = 'OR';
    this.items = items;
    this.shadowItems = [];
    this.shadowQ = [];
  }

  setItems() {
    throw new TypeError(`Filter subclass for ${this.type} must implement setItems() method`);
  }

  addShadowItem(item) {
    console.log('addShadowItem', item);
    if (this.shadowQ.indexOf(item.uid) === -1) {
      this.shadowQ.push(item.uid);
      this.shadowItems.push(item);
    }
  }

  removeShadowItem(item) {
    const idx = this.shadowQ.indexOf(item.uid);
    if (idx !== -1) {
      this.shadowQ.splice(idx, 1);
      this.shadowItems.splice(idx, 1);
    }
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      op: this.op,
      context: this.context,
    };
  }
}
