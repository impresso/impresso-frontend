import Entity from './Entity';
/**
 * FilterEntity object
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default function FilterEntity({
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

  this.getName = () => this.entity.name;

  this.getQuery = () => ({
    context: this.context,
    type: this.type,
    uid: this.entity.uid,
  });
}
