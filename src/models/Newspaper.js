 /**
 * @class Issue is an object representing a newspaper issue
 * @param {String} acronym Three Letter Acronym (TLA) for the newspaper
 * @param {Integer} countArticles Amount of articles in the issue
 * @param {Integer} countPages Amount of pages in the issue
 * @param {Integer} deltaYear total running time of the newspaper
 * @param {Integer} endYear year of last issue
 * @param {String} name Full name if the newspaper
 * @param {Integer} startYear year of first issue
 * @param {String} uid Unique identifier for the newspaper
 */
export default function Newspaper({
  acronym = '',
  countArticles = 0,
  countIssues = 0,
  countPages = 0,
  deltaYear = 0,
  endYear = 0,
  name = '',
  startYear = 0,
  uid = '',
} = {}) {
  this.acronym = acronym;
  this.countArticles = countArticles;
  this.countIssues = countIssues;
  this.countPages = countPages;
  this.deltaYear = deltaYear;
  this.endYear = endYear;
  this.name = name;
  this.startYear = startYear;
  this.uid = uid;
}
