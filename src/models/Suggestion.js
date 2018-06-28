import Entity from './Entity';
import Daterange from './Daterange';
/**
 * @class Suggestion is an object representing an autocomplete query Suggestion
 * @param {Daterange} daterange Daterange Object
 * @param {Entity} entity Entity Object
 * @param {String} query String representing the original typed query
 * @param {String} type String representing the type of suggestion i.e. 'entity', 'datarange'
 */

export default function Suggestion({
  entity = new Entity(),
  daterange = new Daterange(),
  query = '',
  type = '',
} = {}) {
  if (entity instanceof Entity) {
    this.entity = entity;
  } else {
    this.entity = new Entity(entity);
  }

  if (daterange instanceof Daterange) {
    this.daterange = daterange;
  } else {
    this.daterange = new Daterange(daterange);
  }

  this.query = String(query);

  this.type = type;
}
