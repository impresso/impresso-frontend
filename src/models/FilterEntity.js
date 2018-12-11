import Entity from '@/models/Entity';
import Filter from '@/models/FilterBase';
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default class FilterEntity extends Filter {
  constructor(args) {
    super(args);

    if (args.entity instanceof Entity) {
      this.entity = args.entity;
    } else {
      this.entity = new Entity(args.entity);
    }
  }

  getName() {
    return this.entity.name;
  }

  getQuery() {
    return {
      context: this.context,
      type: 'string', // type: this.type,
      q: this.entity.name, // remove this line
      uid: this.entity.uid,
    };
  }
}
