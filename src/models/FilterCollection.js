/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import FilterItems from '@/models/FilterItems';
import Collection from '@/models/Collection';

export default class FilterCollection extends FilterItems {
  setItems(items = []) {
    this.items = items.map((d) => {
      const item = new Collection(d);
      item.checked = true;
      return item;
    });
  }
}
