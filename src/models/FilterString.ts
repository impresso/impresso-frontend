/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import type { Entity as IEntity, FilterWithItemsInterface } from '.'
import FilterItems from '@/models/FilterItems'
import * as precisions from './Precisions'
import * as contexts from './Contexts'

class StringItem implements IEntity {
  id: string
  checked: boolean
  isValid: boolean
  label: string

  constructor({ id, checked = true }) {
    this.id = id
    this.label = id
    this.checked = Boolean(checked)
    this.isValid = typeof this.id === 'string' && this.id.trim().length > 0
  }
}

export default class FilterString extends FilterItems<StringItem> {
  distance: number

  constructor(args: FilterWithItemsInterface<StringItem> & { distance?: number }) {
    super({ ...args, items: [] })
    const precision = args.precision ?? precisions.EXACT
    this.precision = precision
    this.distance = Math.max(0, Math.min(parseInt(String(args.distance ?? 0), 10), 10))
    // console.info('FilterString built', this.q, this.items, args);
  }

  setItems(items = []) {
    this.items = items
      .map(id => {
        if (id instanceof StringItem) {
          return id
        }
        return new StringItem({ id })
      })
      .filter(item => item.isValid)
  }

  getQuery() {
    const query = {
      type: this.type,
      op: this.op,
      q: this.items.map(d => d.id),
      precision: this.precision,
      ...(this.distance !== 0 ? { distance: this.distance } : {}),
      ...(this.context !== contexts.INCLUDE ? { context: this.context } : {})
    }
    return query
  }
}
