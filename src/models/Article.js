import Collection from './Collection';
import Issue from './Issue';
import Match from './Match';
import Newspaper from './Newspaper';
import Page from './Page';
import Region from './Region';
import Tag from './Tag';

/**
 * @class Article is an object representing a newspaper article
 * @param {String} country Country Code
 * @param {Array} collections List of Collection objects the article belongs to
 * @param {Date} date Date of the article
 * @param {String} excerpt First 20 or so words of an article
 * @param {Integer} dl number of entities (Document Length)
 * @param {Boolean} isCC wether the article regions are corrected
 * @param {Boolean} isFront appears on the frontpage
 * @param {Issue} issue Issue object of the article
 * @param {Array} labels Array of Strings with labels for the article
 * @param {String} language The language of the article
 * @param {Array} matches Array of Matches objects
 * @param {Interger} nbPages article page spread
 * @param {Newspaper} newspaper Newspaper object
 * @param {Array} pages Array of Page objects
 * @param {Array} regions Array of Region objects
 * @param {Integer} size character count
 * @param {Array} tags Array of Tag objects
 * @param {Interger} time Unix timestamp of the article
 * @param {String} title Title of the article
 * @param {String} type type of article 'ad' = advertisement, 'ar' = article
 * @param {String} uid Unique identifier for the article
 * @param {Number} year Year of the article
 */
export default function Article({
  country = '',
  collections = [],
  date = new Date(),
  excerpt = '',
  dl = 0,
  isCC = false,
  isFront = false,
  issue = new Issue(),
  labels = [],
  language = '',
  matches = [],
  nbPages = 0,
  newspaper = new Newspaper(),
  pages = [],
  regions = [],
  size = 0,
  tags = [],
  time = 0,
  title = '',
  type = '',
  uid = '',
  year = 0,
} = {}) {
  this.collections = collections.map((collection) => {
    if (collection instanceof Collection) {
      return collection;
    }

    return new Collection(collection);
  });

  this.country = String(country);
  this.date = new Date(date);
  this.excerpt = String(excerpt);
  this.dl = parseInt(dl, 10);
  this.isCC = Boolean(isCC);
  this.isFront = Boolean(isFront);

  if (issue instanceof Issue) {
    this.issue = issue;
  } else {
    this.issue = new Issue(issue);
  }

  this.labels = labels.map(label => String(label));

  this.language = String(language);

  this.matches = matches.map((match) => {
    if (match instanceof Match) {
      return match;
    }

    return new Match(match);
  });

  this.nbPages = parseInt(nbPages, 10);

  if (newspaper instanceof Newspaper) {
    this.newspaper = newspaper;
  } else {
    this.newspaper = new Newspaper(newspaper);
  }

  this.pages = pages.map((page) => {
    if (page instanceof Page) {
      return page;
    }

    return new Page(page);
  });

  this.size = parseInt(size, 10);

  this.regions = regions.map((region) => {
    if (region instanceof Region) {
      return region;
    }

    return new Region(region);
  });

  this.tags = tags.map((tag) => {
    if (tag instanceof Tag) {
      return tag;
    }

    return new Tag(tag);
  });

  this.time = parseInt(time, 10);
  this.title = String(title);
  this.type = String(type);
  this.uid = String(uid);
  this.year = parseInt(year, 10);
}
