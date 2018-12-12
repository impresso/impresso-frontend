import Daterange from './Daterange';
import Entity from './Entity';
/**
 * Query Component object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} q The search query
 * @param {Entity} entity Entity object
 * @param {Daterange} daterange Daterange object
 * @param {String} type The type of filter (entity, string)
 */

export default class QueryComponent {
  constructor({
    context = 'include',
    q = '',
    entity = new Entity(),
    daterange = null,
    type = '',
  } = {}) {
    const daterangeRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z TO \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;

    this.context = context;
    this.query = String(q);

    if (daterange instanceof Daterange) {
      this.daterange = daterange;
    } else if (typeof daterange === 'string' && daterangeRegex.test(daterange)) {
      this.daterange = new Daterange({
        daterange,
      });
    }

    if (entity instanceof Entity) {
      this.entity = entity;
    } else {
      this.entity = new Entity(entity);
    }

    this.type = type;
  }

  getName() {
    if (this.type === 'entity') {
      return this.entity.name;
    }
    return this.query;
  }

  getUid() {
    if (this.entity.uid !== '') {
      return this.entity.uid;
    }
    return undefined;
  }
}
