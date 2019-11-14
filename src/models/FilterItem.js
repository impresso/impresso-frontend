import FilterItems from '@/models/FilterItems';

/**
 * Add uid field to each item in method setItems
 * @type {Array}
 */
export default class FilterItem extends FilterItems {
  setItems(items = []) {
    this.items = items.map((d) => {
      const item = typeof d === 'object' ? d : {
        uid: String(d),
      };
      item.checked = true;
      return item;
    });
  }
}
