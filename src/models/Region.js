/**
 * @class Article is an object representing a newspaper article
 * @param {String} articleUid Unique identifier for the article
 */
export default class Region {
  constructor({
    articleUid = '',
    pageUid = '',
    coords = false,
    // g = [],
    iiifFragment = '',
    isEmpty = false,
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

    this.isEmpty = isEmpty;
    // this.g = g.map(line => String(line));

    this.iiifFragment = String(iiifFragment);
  }
}
