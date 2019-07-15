import Entity from '@/models/Entity';
import FilterItems from '@/models/FilterItems';

export default class FilterEntity extends FilterItems {
  setItems(items = []) {
    debugger;
    this.items = items.map(d => new Entity(d));
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }
}
