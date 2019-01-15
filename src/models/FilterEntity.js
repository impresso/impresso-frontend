import Entity from '@/models/Entity';
import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} item Entity object
 */

export default class FilterEntity extends Filter {
  constructor(args) {
    super(args);

    if (args.item instanceof Entity) {
      this.item = args.item;
    } else {
      this.item = new Entity(args.item);
    }
  }

  getName() {
    return this.item.name;
  }

  getQuery() {
    return {
      context: this.context,
      type: 'string', // type: this.type,
      precision: 'regular',
      q: this.item.name, // remove this line
    };
  }
}
