/**
 * @class Article is an object representing a newspaper article
 * @param {String} articleUid Unique identifier for the article
 * @param {Array} regions Array of region objects
 */
export default class Region {
  constructor({
    articleUid = '',
    pageUid = '',
    coords = false,
    g = [],
    iiifFragment = '',
  } = {}) {
    this.articleUid = String(articleUid);
    this.pageUid = String(pageUid);

    if (coords) {
      this.coords = {
        x: coords[0],
        y: coords[1],
        w: coords[2],
        h: coords[3],
      };
    } else {
      this.coords = false;
    }

    this.g = g.map(line => String(line));

    this.iiifFragment = String(iiifFragment);
  }
}
