import Collection from './Collection';
import Entity from './Entity';
import Match from './Match';
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
    accessRight = 'na',
    // to be added dinamically from TOC
    matches = [],
    images = [],
    contentLineBreaks = [],
    regionBreaks = [],
    mentions = [],
    content = ''
  } = {}) {
    this.uid = String(uid);
    this.type = String(type);
    this.title = String(title);
    this.excerpt = String(excerpt);
    this.isCC = Boolean(isCC);
    this.size = parseInt(size, 10);
    this.nbPages = parseInt(nbPages, 10);
    this.pages = pages;
    this.accessRight = accessRight;
    this.images = images;
    this.contentLineBreaks = contentLineBreaks;
    this.regionBreaks = regionBreaks;
    this.mentions = mentions;
    this.content = content;

    this.collections = collections.map((collection) => {
      if (collection instanceof Collection) {
        return collection;
      }
      return new Collection(collection);
    });

    this.matches = matches.map((match) => {
      if (match instanceof Match) {
        return match;
      }
      return new Match(match);
    });

    this.locations = locations.map((location) => {
      if (location instanceof Entity) {
        return location;
      }
      return new Entity(location);
    });

    this.persons = persons.map((person) => {
      if (person instanceof Entity) {
        return person;
      }
      return new Entity(person);
    });

    // no title?
    if (!this.title.length && this.excerpt.length) {
      const parts = this.excerpt.split(/\s/);
      this.title = parts.slice(0, 4).join(' ');
      this.excerpt = parts.slice(4).join(' ');
    }
  }
}
