import Newspaper from './Newspaper';
import Entity from './Entity';
import Page from './Page';

/**
 * @class Issue is an object representing a newspaper issue
 * @param {Integer} countArticles Amount of articles in the issue
 * @param {Integer} countPages Amount of pages in the issue
 * @param {Date} date Date of the issue
 * @param {Array} entities Array of Entity objects
 * @param {Newspaper} newspaper Newspaper object
 * @param {Array} pages Array of Page objects
 * @param {String} uid Unique identifier for the newspaper
 * @param {Integer} year Full year of issue
 */
export default function Issue({
  countArticles = 0,
  countPages = 0,
  date = new Date(),
  entities = [],
  newspaper = new Newspaper(),
  pages = [],
  uid = '',
  year = 0,
} = {}) {
  this.countArticles = countArticles;
  this.countPages = countPages;
  this.date = new Date(date);

  this.entities = entities.map((entity) => {
    if (entity instanceof Entity) {
      return entity;
    }

    return new Entity(entity);
  });

  if (newspaper instanceof Newspaper) {
    this.newspaper = newspaper;
  } else {
    this.newspaper = new Newspaper(newspaper);
  }

  this.pages = pages.map((page) => {
    if (page instanceof Page) {
      return page;
    }

    return new Page(page);
  });

  if (this.pages.length > 0) {
    this.lastPageNumber = this.pages[this.pages.length - 1].num;
  } else {
    this.lastPageNumber = 0;
  }


  this.uid = String(uid);
  this.year = parseInt(year, 10);
}
