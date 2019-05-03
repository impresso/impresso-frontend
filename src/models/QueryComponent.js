import Daterange from './Daterange';
import Entity from './Entity';
import Topic from './Topic';
import Newspaper from './Newspaper';
import Collection from './Collection';
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
    daterange = null,
  } = {}) {
    const daterangeRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z TO \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;
    this.q = q;
    this.context = context;
    this.type = type;
    this.daterange = daterange;

    if (daterange instanceof Daterange) {
      this.daterange = daterange;
    } else if (typeof daterange === 'string' && daterangeRegex.test(daterange)) {
      this.daterange = new Daterange({
        daterange,
      });
    }

    const KlassMapper = {
      topic: Topic,
      entity: Entity,
      newspaper: Newspaper,
      daterange: Daterange,
      collection: Collection,
    };

    if (KlassMapper[type] && items.length) {
      this.items = items.map(d => new KlassMapper[type](d));
    } else {
      this.items = [];
    }
  }
}
