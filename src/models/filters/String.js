/**
 * String filter
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

export default function StringFilter({
  context = 'include',
  query = '',
} = {}) {
  this.context = context;
  this.query = query;
  this.type = 'string';
}
