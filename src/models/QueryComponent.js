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

export default function QueryComponent({
  context = 'include',
  q = '',
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

  this.query = String(q);

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

// queryComponents: res.info.toSq.map((el) => {
//   let daterange;
//   if (el.daterange) {
//     daterange = el.daterange.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z TO \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);
//     if (daterange.length) {
//       daterange = new Daterange({
//         daterange: daterange[0],
//       });
//     }
//   }
//   return new Filter({
//     ...el,
//     query: el.q,
//     daterange,
//   });
// }),
