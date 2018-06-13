/**
 * Collection is an object representing a user generated collection of entityes, articles, etc.
 * @param {Integer} df Document Frequency
 * @param {Array} labels Array with labels as strings
 * @param {String} name Name of the Namend Entity
 * @param {String} uid Unique identifier for the Named Entity
 */
export default function Collection({
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
