/**
 * FilterRegex object
 * @param {String} query The search query
 */
import * as contexts from './Contexts';

export default class FilterRegex {
  constructor({
    query = '',
  } = {}) {
    this.type = 'regex';
    this.query = String(query);
    this.context = contexts.INCLUDE;
  }

  getName() {
    return this.query;
  }

  getQuery() {
    return {
      type: this.type,
      q: this.query,
      context: this.context,
    };
  }
}
