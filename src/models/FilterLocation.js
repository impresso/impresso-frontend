/**
 * FilterPerson object
 * @param {String} query The search query
 */
import Entity from '@/models/Entity';
import FilterItems from '@/models/FilterItems';

export default class FilterLocation extends FilterItems {
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
    this.items = items.map(d => new Entity(d));
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }
}
