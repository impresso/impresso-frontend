/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

export default function FilterString({
  context = 'include',
  query = '',
} = {}) {
  this.type = 'string';
  this.context = context;
  this.query = String(query);
}
