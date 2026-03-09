/**
 * @class Match is an object representing search query in an article
 * @param {Array} coords Array of numbers
 * @param {String} fragment Matches string in the article
 * @param {String} pageId Uid of the page of the fragment
 * @param {String} iiif Image of the fragment
 */
export default class Match {
  constructor({
    coords = [],
    fragment = '',
    pageId = '',
    iiif = '',
  } = {}) {
    this.coords = coords.map(coord => parseInt(coord, 10));
    this.fragment = String(fragment);
    this.pageId = String(pageId);
    this.iiif = String(iiif);
  }
}
