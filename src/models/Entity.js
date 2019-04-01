/**
 * @class Entity is an object representing a named entity
 * @param {String} name
 * @param {Integer} id Unique identifier for the entity
 * @param {String} wikidataId
 * @param {String} dbpediaURL
 * @param {String} impressoId
 */
export default class Entity {
  constructor({
    id = 0,
    name = '',
    wikidataId = null,
    dbpediaURL = null,
    impressoId = null,
  } = {}) {
    this.name = String(name);
    this.id = parseInt(id, 10);
    this.wikidataId = wikidataId;
    this.dbpediaURL = dbpediaURL;
    this.impressoId = impressoId;
  }
}
