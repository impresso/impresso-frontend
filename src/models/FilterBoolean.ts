import Filter from '@/models/FilterBase'
import { isEntityWithName } from '@/models/typeGuards'
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 */

export default class FilterBoolean extends Filter {
  constructor(options) {
    super(options)
    this.q = undefined
  }
  getName() {
    const item = this.items?.[0]
    if (!item) return ''
    return isEntityWithName(item) ? item.name : item.label
  }

  getQuery() {
    return {
      type: this.type
    }
  }
}
