/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import FilterItems from '@/models/FilterItems'
import * as precisions from './Precisions'
import * as contexts from './Contexts'

class StringItem {
  constructor({ uid = '', checked = true }) {
    this.uid = uid
    this.checked = Boolean(checked)
    this.isValid = typeof this.uid === 'string' && this.uid.trim().length > 0
  }
}

export default class FilterString extends FilterItems {
  constructor(args) {
    super(args)
    this.precision = precisions[(args.precision || 'exact').toUpperCase()]
    this.distance = Math.max(0, Math.min(parseInt(args.distance || 0, 10), 10))
    // console.info('FilterString built', this.q, this.items, args);
  }

  setItems(items = []) {
    this.items = items
      .map((uid) => {
        if (uid instanceof StringItem) {
          return uid
        }
        return new StringItem({ uid })
      })
      .filter((item) => item.isValid)
  }

  getQuery() {
    const query = {
      type: this.type,
      op: this.op,
      q: this.items.map((d) => d.uid),
      precision: this.precision
    }

    if (this.distance !== 0) {
      query.distance = this.distance
    }
    if (this.context !== contexts.INCLUDE) {
      query.context = this.context
    }
    return query
  }
}
