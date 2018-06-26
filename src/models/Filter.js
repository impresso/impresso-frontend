import Entity from './Entity';
/**
 * Filter object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 * @param {Entity} entity Entity object
 * @param {String} type The type of filter (entity, string)
 */

export default function Filter({
  context = 'include',
  query = '',
  entity = new Entity(),
  type = '',
} = {}) {
  this.context = context;

  if (entity instanceof Entity) {
    this.entity = entity;
  } else {
    this.entity = new Entity(entity);
  }

  this.query = String(query);

  this.type = type;

  this.getName = () => {
    if (this.type === 'entity') {
      return this.entity.name;
    }
    return this.query;
  };

  this.getUid = () => {
    if (this.entity.uid !== '') {
      return this.entity.uid;
    }
    return undefined;
  };
}
