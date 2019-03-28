/**
 * @todo write class description
 * @class ArticleTagProperties is an object decsribing with metadata about an ArticleTag object
 * @param {Date} creationDate Date object when ArticleTag object is created
 * @param {Int} creationTime Timestamp when ArticleTag object is created
 * @param {String} creator Creator of the ArticleTag object
 * @param {Date} lastModifiedDate Date object when ArticleTag object is modified
 * @param {Int} lastModifiedTime Timestamp when ArticleTag object is modified
 */
export default class ArticleTagProperties {
  constructor({
    creationDate = new Date(),
    creationTime = 0,
    creator = '',
    lastModifiedDate = new Date(),
    lastModifiedTime = 0,
  } = {}) {
    this.creationDate = new Date(creationDate);
    this.creationTime = parseInt(creationTime, 10);
    this.creator = String(creator);
    this.lastModifiedDate = new Date(lastModifiedDate);
    this.lastModifiedTime = parseInt(lastModifiedTime, 10);
  }
}
