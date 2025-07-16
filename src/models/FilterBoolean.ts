import Filter from '@/models/FilterBase'
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
    return this.items[0].name
  }

  getQuery() {
    return {
      type: this.type
    }
  }
}
