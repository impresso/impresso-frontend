import FilterItems from '@/models/FilterItems';
/**
 * FilterEntity object
 * @param {Object} bucket The bucket
 * @param {String} type type of filter, eg, 'newspaper', 'language'...
 * @param {Boolean} touched wether the user has interacted with the filter
 */

export default class FilterLanguage extends FilterItems {
  constructor(args) {
    super(args);
    if (!this.items.length) {
      this.items = this.q.map(d => ({
        uid: d,
        checked: true,
      }));
    }
  }

  setItems(items = []) {
    this.items = items;
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }
}
