import Newspaper from '@/models/Newspaper';

/**
 * @class Issue is an object representing a newspaper issue
 * @param {Integer} countArticles Amount of articles in the issue
 * @param {Integer} countPages Amount of pages in the issue
 * @param {Date} date Date of the issue as yyyy-mm-dd
 * @param {Array} entities Array of Entity objects
 * @param {Newspaper} newspaper Newspaper object
 * @param {Array} pages Array of Page objects
 * @param {String} uid Unique identifier for the newspaper
 * @param {Integer} year Full year of issue
 */
export default function Issue({
  countArticles = 0,
  countPages = 0,
  date = '',
  entities = [],
  newspaper = new Newspaper(),
  pages = [],
  uid = '',
  year = 0,
} = {}) {
  this.countArticles = countArticles;
  this.countPages = countPages;
  this.date = date;
  this.entities = entities;
  this.newspaper = newspaper;
  this.pages = pages;
  this.uid = uid;
  this.year = year;
}
