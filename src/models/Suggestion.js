import Entity from './Entity';
/**
 * @class Suggestion is an object representing an autocomplete query Suggestion
 * @param {Entity} entity Entity Object
 * @param {String} query String representing the original typed query
 * @param {String} type String representing the type of suggestion i.e. 'entity'
 */

export default function Suggestion({
  entity = new Entity(),
  query = '',
  type = '',
} = {}) {
  if (entity instanceof Entity) {
    this.entity = entity;
  } else {
    this.entity = new Entity(entity);
  }

  this.query = String(query);

  this.type = type;

  this.hasLabel = needle => this.entity.labels.find(label => label === needle);
}
