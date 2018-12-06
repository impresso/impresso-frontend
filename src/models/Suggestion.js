/**
 * @class Suggestion is a base class representing an autocomplete query Suggestion
 * @param {Daterange} daterange Daterange Object
 * @param {Entity} entity Entity Object
 * @param {String} query String representing the original typed query
 * @param {String} type String representing the type of suggestion i.e. 'entity', 'datarange'
 */

export default class Suggestion {
  constructor({
    context = 'include',
    type = 'string',
  } = {}) {
    this.context = String(context);
    this.type = String(type);
  }
}
