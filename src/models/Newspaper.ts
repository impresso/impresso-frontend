import type { Entity as IEntity } from '.'
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
export default class Newspaper implements IEntity {
  acronym: string
  countArticles: number
  countIssues: number
  countPages: number
  deltaYear: number
  endYear: number
  name: string
  startYear: number
  uid: string
  id: string
  properties: string[]
  firstIssue: Issue | null
  lastIssue: Issue | null
  included: boolean

  checked?: boolean

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
    this.countArticles = countArticles
    this.countIssues = countIssues
    this.countPages = countPages
    this.deltaYear = deltaYear
    this.endYear = endYear
    this.name = String(name)
    this.startYear = startYear
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
