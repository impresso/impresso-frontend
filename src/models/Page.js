/**
 * @class Page is an object representing a newspaper page
 * @param {Url} iiif Link to iiif resource
 * @param {Integer} num Page number
 * @param {String} uid Unique identifier for the newspaper
 */
export default function Page({
  iiif = '',
  num = 0,
  uid = '',
} = {}) {
  this.iiif = iiif;
  this.num = num;
  this.uid = uid;
}
