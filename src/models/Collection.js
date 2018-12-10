/**
 * Collection is an object representing a user generated collection of entityes, articles, etc.
 * @param {Integer} countArticles Number of articles in the collection
 * @param {Integer} countEntities Number of entities in the collection
 * @param {Integer} countIssues Number of issues in the collection
 * @param {Integer} countPages Number of pages in the collection
 * @param {Date} creationDate Date object when the collection was created
 * @param {Integer} creationTime Timestamp when the collection was created
 * @param {String} description Textual description of the collection by the user
 * @param {Array} items List of items in the collection of type Entity, Issue, Newspaper or Page
 * @param {Array} labels List of strings describing the collection object, set by server ('bucket')
 * @param {Date} lastModifiedDate Date object when the collection was last modified
 * @param {Integer} lastModifiedTime Timestamp when the collection was last modified
 * @param {String} name Name of collection set by the user
 * @param {String} uid Unique identifier for the Collection
 */
export default class Collection {
  constructor({
    countArticles = 0,
    countEntities = 0,
    countIssues = 0,
    countPages = 0,
    creationDate = new Date(),
    creationTime = 0,
    description = '',
    items = [],
    labels = [],
    lastModifiedDate = new Date(),
    lastModifiedTime = 0,
    name = '',
    uid = '',
  } = {}) {
    this.countArticles = parseInt(countArticles, 10);
    this.countEntities = parseInt(countEntities, 10);
    this.countIssues = parseInt(countIssues, 10);
    this.countPages = parseInt(countPages, 10);
    this.creationDate = new Date(creationDate);
    this.creationTime = parseInt(creationTime, 10);
    this.description = String(description);
    this.items = items.map(item => item); // todo here we have to use models
    this.labels = labels.map(label => String(label));
    this.lastModifiedDate = new Date(lastModifiedDate);
    this.lastModifiedTime = parseInt(lastModifiedTime, 10);
    this.name = String(name);
    this.uid = String(uid);
  }
}
