import Entity from './Entity';
/**
 * @class ArticleBase is an object representing a newspaper article in
 * issue Table of contents. that 's why it is simplified.
 * @param {String}  [uid='']         Article identifier
 * @param {String}  [type='']        type of article 'ad' = advertisement, 'ar' = article
 * @param {String}  [title='']       [description]
 * @param {String}  [excerpt='']     [description]
 * @param {Boolean} [isCC=false]     [description]
 * @param {Number}  [size=0]         [description]
 * @param {Number}  [nbPages=0]      [description]
 * @param {Array}   [pages=[]]       [description]
 * @param {Array}   [persons=[]]     [description]
 * @param {Array}   [locations=[]]   [description]
 * @param {Array}   [collections=[]] [description]
 * @param {Array}   [matches=[]]     [description]
 * @param {Array}   [images=[]]      [description]
 */
export default class ArticleBase {
  constructor({
    uid = '',
    type = '',
    title = '',
    excerpt = '',
    isCC = false,
    size = 0,
    nbPages = 0,
    pages = [],
    persons = [],
    locations = [],
    collections = [],
    // to be added dinamically from TOC
    matches = [],
    images = [],
  } = {}) {
    this.uid = String(uid);
    this.type = String(type);
    this.title = String(title);
    this.excerpt = String(excerpt);
    this.isCC = !!isCC;
    this.size = parseInt(size, 10);
    this.nbPages = parseInt(nbPages, 10);
    this.pages = pages;
    this.persons = persons.map(d => new Entity(d));
    this.locations = locations.map(d => new Entity(d));
    this.collections = collections;
    this.matches = matches;
    this.images = images;
  }
}
