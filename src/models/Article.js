import Issue from './Issue';
import Page from './Page';
import Tag from './Tag';
/**
 * @class Article is an object representing a newspaper article
 * @param {Date} date Date of the article
 * @param {Integer} dl @todo describe parameter
 * @param {Issue} issue Issue object of the article
 * @param {Array} labels Array of Strings with labels for the article
 * @param {String} newspaperUid Unique identifier for the newspaper
 * @param {Array} pages Array of Page objects
 * @param {Array} tags Array of Tag objects
 * @param {Interger} time Unix timestamp of the article
 * @param {String} title Title of the article
 * @param {String} uid Unique identifier for the article
 */
export default function Article({
  date = new Date(),
  dl = 0,
  issue = new Issue(),
  labels = [],
  newspaperUid = '',
  pages = [],
  tags = [],
  time = 0,
  title = '',
  uid = '',
} = {}) {
  this.date = new Date(date);
  this.dl = parseInt(dl, 10);

  if (issue instanceof Issue) {
    this.issue = issue;
  } else {
    this.issue = new Issue(issue);
  }

  this.labels = labels.map(label => String(label));
  this.newspaperUid = String(newspaperUid);

  this.pages = pages.map((page) => {
    if (page instanceof Page) {
      return page;
    }

    return new Page(page);
  });

  this.tags = tags.map((tag) => {
    if (tag instanceof Tag) {
      return tag;
    }

    return new Tag(tag);
  });

  this.time = parseInt(time, 10);
  this.title = String(title);
  this.uid = String(uid);
}
