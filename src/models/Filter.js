import Daterange from './Daterange';
import Entity from './Entity';
/**
 * Filter object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 * @param {Entity} entity Entity object
 * @param {Daterange} daterange Daterange object
 * @param {String} type The type of filter (entity, string)
 */

export default function Filter({
  context = 'include',
  query = '',
  entity = new Entity(),
  daterange = new Daterange(),
  type = '',
} = {}) {
  this.context = context;

  if (daterange instanceof Daterange) {
    this.daterange = daterange;
  } else {
    this.daterange = new Daterange(daterange);
  }

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
