/**
 * @class Match is an object representing search query in an article
 * @param {Array} coords Array of numbers
 * @param {String} fragment Matches string in the article
 * @param {String} pageUid Uid of the page of the fragment
 * @param {String} iiif Image of the fragment
 */
export default function Match({
  coords = [],
  fragment = '',
  pageUid = '',
  iiif = '',
} = {}) {
  this.coords = coords.map(coord => parseInt(coord, 10));

  this.fragment = String(fragment);

  this.pageUid = String(pageUid);

  this.iiif = String(iiif);
}
