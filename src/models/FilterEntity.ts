import FilterItems from '@/models/FilterItems';
import Entity from '@/models/Entity';

export default class FilterEntity extends FilterItems {
  setItems(items = []) {
    this.items = items.map((uid) => {
      const item = typeof uid === 'object' ? new Entity(uid) : new Entity({
        uid,
      });
      item.checked = true;
      return item;
    });
  }
}
