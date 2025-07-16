/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import type { Entity as IEntity } from '.'
import FilterItems from '@/models/FilterItems'
import * as precisions from './Precisions'
import * as contexts from './Contexts'

class StringItem implements IEntity {
  uid: string
  checked: boolean
  isValid: boolean

  constructor({ uid, checked = true }) {
    this.uid = uid
    this.checked = Boolean(checked)
    this.isValid = typeof this.uid === 'string' && this.uid.trim().length > 0
  }
}

export default class FilterString extends FilterItems {
  distance: number

  constructor(args) {
    super(args)
    this.precision = precisions[(args.precision || 'exact').toUpperCase()]
    this.distance = Math.max(0, Math.min(parseInt(args.distance || 0, 10), 10))
    // console.info('FilterString built', this.q, this.items, args);
  }

  setItems(items = []) {
    this.items = items
      .map(uid => {
        if (uid instanceof StringItem) {
          return uid
        }
        return new StringItem({ uid })
      })
      .filter(item => item.isValid)
  }

  getQuery() {
    const query = {
      type: this.type,
      op: this.op,
      q: this.items.map(d => d.uid),
      precision: this.precision,
      ...(this.distance !== 0 ? { distance: this.distance } : {}),
      ...(this.context !== contexts.INCLUDE ? { context: this.context } : {})
    }
    return query
  }
}
