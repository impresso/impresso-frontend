/**
 * @class Article is an object representing a newspaper article
 * @param {String} uid Unique identifier for the article
 * @param {Date} date Date of the article
 * @param {Array} labels Array of Strings with labels for the article
 * @param {String} newspaperUid Unique identifier for the newspaper
 */
export default function Article({
  uid = '',
  date = new Date(),
  labels = [],
  newspaperUid = '',
} = {}) {
  this.uid = String(uid);
  this.date = new Date(date);
  this.labels = labels.map(label => String(label));
  this.newspaperUid = String(newspaperUid);
}
