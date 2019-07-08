/**
 * FilterPerson object
 * @param {String} query The search query
 */
import Entity from '@/models/Entity';
import FilterItems from '@/models/FilterItems';

export default class FilterPerson extends FilterItems {
  constructor(args) {
    super(args);

    this.item = {
      frequence: parseInt(args.item.frequence, 10),
      name: String(args.item.name),
      type: String(args.item.type),
    };

    this.h = String(args.h);
  }

  setItems(items = []) {
    this.items = items.map(d => new Entity(d));
    items.forEach((d, i) => {
      this.items[i].checked = true;
    });
  }

  getQuery() {
    return {
      type: this.type,
      firstname: this.firstname,
      surname: this.surname,
      title: this.title,
      qualifier: this.qualifier,
      fn: this.fn,
      demonym: this.demonym,
      context: this.context,
    };
  }
}
