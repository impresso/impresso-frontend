import Issue from './Issue'

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
export default class Newspaper {
  constructor({
    acronym = '',
    countArticles = 0,
    countIssues = 0,
    countPages = 0,
    deltaYear = 0,
    endYear = 0,
    name = '',
    startYear = 0,
    uid = '',
    id = '',
    properties = [],
    firstIssue = null,
    lastIssue = null,
    included = false
  } = {}) {
    this.acronym = String(acronym)
    this.countArticles = parseInt(countArticles, 10)
    this.countIssues = parseInt(countIssues, 10)
    this.countPages = parseInt(countPages, 10)
    this.deltaYear = parseInt(deltaYear, 10)
    this.endYear = parseInt(endYear, 10)
    this.name = String(name)
    this.startYear = parseInt(startYear, 10)
    this.uid = String(uid)
    this.id = id.length ? String(id) : this.uid
    this.properties = properties
    this.included = included

    if (firstIssue) {
      this.firstIssue = new Issue(firstIssue)
    }
    if (lastIssue) {
      this.lastIssue = new Issue(lastIssue)
    }
  }
}
