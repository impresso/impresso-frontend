import FilterItems from '@/models/FilterItems'
import Newspaper from '@/models/Newspaper'

/**
 * FilterNewspaper object
 * @param {Object} q A string. Translated to an array.
 * @param {String} items if any
 */
export default class FilterNewspaper extends FilterItems {
  setItems(items = []) {
    this.items = items.map(d => {
      const item = new Newspaper(d)
      item.checked = true
      return item
    })
  }
}
