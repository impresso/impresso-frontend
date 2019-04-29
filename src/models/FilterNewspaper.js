import FilterItems from '@/models/FilterItems';
import Newspaper from '@/models/Newspaper';

/**
 * FilterNewspaper object
 * @param {Object} q A string. Translated to an array.
 * @param {String} items if any
 */
export default class FilterNewspaper extends FilterItems {
  constructor(args) {
    super(args);
    // if there is no items, create them out of this.q array
    if (!this.items.length) {
      this.items = this.q.map(uid => new Newspaper({
        uid,
      }));
    }
  }

  setItems(items = []) {
    this.items = items.map(d => new Newspaper(d));
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }
}
