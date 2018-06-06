import Entity from '../Entity';

/**
 * Named Entity filter
 * @param {String} context either 'include' or 'exclude'
 * @param {Entity} entity Entity object
 */

export default function NamedEntityFilter({
  context = 'include',
  entity = new Entity(),
} = {}) {
  this.context = context;

  if (entity instanceof Entity) {
    this.entity = entity;
  } else {
    this.entity = new Entity(entity);
  }

  this.type = 'entity';
}
