import * as contexts from './Contexts'
import type { Entity, Filter, FilterWithItems, FilterWithItemsInterface } from '.'
import { FilterContext, FilterOperator } from 'impresso-jscommons'

/**
 * FilterItems is the base class for a filter having one or more items
 * @param {String} query The search query
 */
export default class FilterItems<T = Entity> implements FilterWithItemsInterface<T> {
  type: FilterWithItems<T>['type']
  q: string | string[]
  op?: FilterOperator
  context?: FilterContext
  precision?: Filter['precision']
  items: T[]
  touched: boolean

  constructor({
    context = contexts.INCLUDE,
    type = 'string',
    touched = false,
    q = '',
    op = 'OR',
    precision,
    items = []
  }: FilterWithItems<T> & { touched?: boolean }) {
    this.context = context
    this.type = type
    this.touched = touched
    this.precision = precision

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

  setItems(items: string | string[]) {
    throw new TypeError(`Filter subclass for ${this.type} must implement setItems() method`)
  }

  getQuery(): Filter {
    return {
      type: this.type,
      q: this.q,
      op: this.op,
      ...(this.context !== contexts.INCLUDE ? { context: this.context } : {})
    }
  }
}
