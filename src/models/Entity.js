
/**
 * @class Entity is an object representing a Named Entity (NE) such as a location or person
 * @param {Array} entities List of Entity objects the entity belongs to
 * @param {Integer} id
 * @param {String} name
 * @param {String} type
 * @param {String} wikidataId
 * @param {String} dbpediaURL
 * @param {String} impressoId
 * @param {Integer} countItems
 * @param {Integer} countMentions
 * @param {Array} wikidata Array with wikidata
 */
export default class Entity {
  constructor({
    entities = [],
    id = 0,
    name = '',
    type = 'entity',
    wikidataId = '',
    dbpediaURL = '',
    impressoId = '',
    countItems = 0,
    countMentions = 0,
    wikidata = [],
  } = {}) {
    this.entities = entities.map((entity) => {
      if (entity instanceof Entity) {
        return entity;
      }

      return new Entity(entity);
    });

    this.id = parseInt(id, 10);
    this.name = String(name);
    this.type = String(type);
    this.countMentions = parseInt(countMentions, 10);
    this.countItems = parseInt(countItems, 10);
    this.wikidataId = String(wikidataId);
    this.dbpediaURL = String(dbpediaURL);
    this.impressoId = String(impressoId);
    this.wikidata = String(wikidata);
  }

  // hasLabel(needle) {
  //   return this.labels.find(label => label === needle);
  // }
  //
  // getLabel(index) {
  //   return this.labels[index];
  // }
}
