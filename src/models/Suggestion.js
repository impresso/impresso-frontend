import Entity from './Entity';
import Newspaper from './Newspaper';
import Daterange from './Daterange';
/**
 * @class Suggestion is an object representing an autocomplete query Suggestion
 * @param {Daterange} daterange Daterange Object
 * @param {Entity} entity Entity Object
 * @param {String} query String representing the original typed query
 * @param {String} type String representing the type of suggestion i.e. 'entity', 'datarange'
 */

export default function Suggestion({
  newspaper = new Newspaper(),
  entity = new Entity(),
  daterange = new Daterange(),
  query = '',
  q = '',
  uid = '',
  type = '',
} = {}) {
  if (entity instanceof Entity) {
    this.entity = entity;
  } else if (entity) {
    this.entity = new Entity(entity);
  }

  if (newspaper instanceof Newspaper) {
    this.newspaper = newspaper;
  } else if (newspaper) {
    this.newspaper = new Newspaper(newspaper);
  } // else ignore

  if (daterange instanceof Daterange) {
    this.daterange = daterange;
  } else {
    this.daterange = new Daterange(daterange);
  }

  this.query = String(query || q);
  this.uid = String(uid);

  this.type = type;
}
