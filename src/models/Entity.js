
/**
 * @class Entity is an object representing a Named Entity (NE) such as a location or person
 * @param {Integer} id
 * @param {String} name
 * @param {String} type
 * @param {String} wikidataId
 * @param {String} dbpediaURL
 * @param {String} impressoId
 * @param {Array} wikidata Array with wikidata
 */
export default class Entity {
  constructor({
    uid = '',
    name = '',
    type = 'entity',
    wikidataId = '',
    dbpediaURL = '',
    impressoId = '',
    countItems = -1,
    countMentions = -1,
    wikidata = [],
  } = {}) {
    this.uid = String(uid);
    if (name.length) {
      this.name = String(name).replace(/^aida-\d+-/, '').split('_').join(' ');
    } else {
      this.name = this.uid.replace(/^aida-\d+-/, '').split('_').join(' ');
    }
    this.type = String(type);
    this.countMentions = parseInt(countMentions, 10);
    this.countItems = parseInt(countItems, 10);
    this.wikidataId = String(wikidataId);
    this.dbpediaURL = String(dbpediaURL);
    this.impressoId = String(impressoId);
    this.wikidata = wikidata;
  }
}
