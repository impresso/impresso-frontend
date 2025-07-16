import Filter from '@/models/FilterBase'
import * as contexts from './Contexts'
import type { Filter as IFilter } from '.'

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
    items = []
  }: IFilter & { touched?: boolean }) {
    super({ context, type, touched, q })
    if (Array.isArray(q)) {
      this.q = q
    } else {
      this.q = String(q).split(',')
    }
    this.op = op

    if (!items.length) {
      this.setItems(this.q)
    } else {
      this.items = items
    }
    this.context = context
  }

  setItems(items: IFilter['q']) {
    throw new TypeError(`Filter subclass for ${this.type} must implement setItems() method`)
  }

  getQuery() {
    return {
      type: this.type,
      q: this.q,
      op: this.op,
      ...(this.context !== contexts.INCLUDE ? { context: this.context } : {})
    }
  }
}
