import Daterange from './Daterange';
import Entity from './Entity';
import Topic from './Topic';
import Newspaper from './Newspaper';
import Collection from './Collection';

const KlassMapper = {
  topic: Topic,
  entity: Entity,
  newspaper: Newspaper,
  collection: Collection,
};

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
    type = '',
    context = 'include',
    q = '',
    items = [],
    precision = '',
    distance = '',
  } = {}) {
    this.q = q;
    this.context = context;
    this.type = type;

    if (type === 'daterange') {
      this.items = this.q.map(daterange => new Daterange({ daterange }));
    } else if (type === 'title' || type === 'string') {
      this.precision = String(precision);
      this.distance = String(distance);
    } else if (KlassMapper[type] && items.length) {
      this.items = items.map(d => new KlassMapper[type](d));
    } else {
      this.items = [];
    }
  }
}
