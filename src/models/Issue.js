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

    return new Entity({
      df: entity.df,
      labels: entity.labels,
      name: entity.name,
      uid: entity.uid,
    });
  });

  if (newspaper instanceof Newspaper) {
    this.newspaper = newspaper;
  } else {
    this.newspaper = new Newspaper({
      acronym: newspaper.acronym,
      countArticles: newspaper.count_articles,
      countIssues: newspaper.count_issues,
      countPages: newspaper.count_pages,
      deltaYear: newspaper.delta_year,
      endYear: newspaper.end_year,
      name: newspaper.name,
      startYear: newspaper.start_year,
      uid: newspaper.uid,
    });
  }

  this.pages = pages.map((page) => {
    if (page instanceof Page) {
      return page;
    }

    return new Page({
      iiif: page.iiif,
      labels: page.labels,
      num: page.num,
      uid: page.uid,
    });
  });
  this.uid = String(uid);
  this.year = parseInt(year, 10);
}
