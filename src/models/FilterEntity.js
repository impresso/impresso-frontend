import Entity from './Entity';
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default class FilterEntity {
  constructor({
    context = 'include',
    entity = new Entity(),
  } = {}) {
    this.type = 'entity';
    this.context = context;

    if (entity instanceof Entity) {
      this.entity = entity;
    } else {
      this.entity = new Entity(entity);
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
