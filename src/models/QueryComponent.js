import Daterange from './Daterange';
import Entity from './Entity';
import Topic from './Topic';
import Newspaper from './Newspaper';
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
    };

    if (KlassMapper[type] && items.length) {
      this.items = items.map(d => new KlassMapper[type](d));
    } else {
      this.items = [];
    }
  }
  //
  //   this.context = context;
  //   this.query = String(q);
  //   this.type = type;
  //
  //   if (daterange instanceof Daterange) {
  //     this.daterange = daterange;
  //   } else if (typeof daterange === 'string' && daterangeRegex.test(daterange)) {
  //     this.daterange = new Daterange({
  //       daterange,
  //     });
  //   }
  //
  //   if (entity instanceof Entity) {
  //     this.entity = entity;
  //   } else {
  //     this.entity = new Entity(entity);
  //   }
  //
  //   if (this.type === 'topic' && item) {
  //     this.item = new Topic(item);
  //   }
  //   if (this.type === 'newspaper' && item) {
  //     this.item = new Newspaper(item);
  //   }
  // }
  //
  // getName() {
  //   if (this.type === 'entity') {
  //     return this.entity.name;
  //   }
  //   return this.query;
  // }
  //
  // getUid() {
  //   if (this.entity.uid !== '') {
  //     return this.entity.uid;
  //   }
  //   return undefined;
  // }
}
