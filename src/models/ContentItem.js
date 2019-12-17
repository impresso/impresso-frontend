import Issue from './Issue';
import Newspaper from './Newspaper';
import Page from './Page';
import Region from './Region';
import Collection from './Collection';

export default class ContentItem {
  constructor({
    uid = '',
    title = '',
    type = 'ci',
    isFront = false,
    hasConvertedCoords = false,
    year = 0,
    date,
    newspaper = null,
    issue = null,
    // related
    collections = [],
    pages = [],
    regions = [],
  } = {}) {
    this.uid = String(uid);
    this.type = String(type);
    this.title = String(title).trim();
    this.year = parseInt(year, 10);
    this.isFront = Boolean(isFront);
    this.hasConvertedCoords = Boolean(hasConvertedCoords);

    if (date instanceof Date) {
      this.date = date;
    } else if (date) {
      this.date = new Date(date);
    }
    this.date = new Date(date);

    if (issue instanceof Issue) {
      this.issue = issue;
    } else if (issue) {
      this.issue = new Issue(issue);
    }

    if (newspaper instanceof Newspaper) {
      this.newspaper = newspaper;
    } else if (newspaper) {
      this.newspaper = new Newspaper(newspaper);
    }

    this.pages = pages.map((page) => {
      if (page instanceof Page) {
        return page;
      }
      return new Page(page);
    });

    this.regions = regions.map((region) => {
      if (region instanceof Region) {
        return region;
      }
      return new Region(region);
    });

    this.collections = collections.map((collection) => {
      if (collection instanceof Collection) {
        return collection;
      }
      return new Collection(collection);
    });
  }
}
