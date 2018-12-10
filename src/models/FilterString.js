/**
 * FilterString object
 * @param {String} context either 'include' or 'exclude'
 * @param {String} query The search query
 */

import * as precisions from './Precisions';
import * as contexts from './Contexts';

export default function FilterString({
  context = contexts.INCLUDE,
  precision = precisions.REGULAR,
  query = '',
} = {}) {
  this.type = 'string';
  this.context = context;
  this.query = String(query);

  this.precision = precisions[precision.toUpperCase()];

  this.getName = () => this.query;

  this.getQuery = () => ({
    context: this.context,
    precision: this.precision,
    type: this.type,
    q: this.query,
  });
}
