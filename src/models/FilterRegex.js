/**
 * FilterRegex object
 * @param {String} query The search query
 */

export default function FilterRegex({
  query = '',
} = {}) {
  this.type = 'regex';
  this.query = String(query);

  this.getName = () => this.query;

  this.getQuery = () => ({
    type: this.type,
    q: this.query,
  });
}
