/**
 * FilterRegex object
 * @param {String} query The search query
 */
import * as contexts from './Contexts';

export default function FilterRegex({
  query = '',
} = {}) {
  this.type = 'regex';
  this.query = String(query);
  this.context = contexts.INCLUDE;

  this.getName = () => this.query;

  this.getQuery = () => ({
    type: this.type,
    q: this.query,
    context: this.context,
  });
}
